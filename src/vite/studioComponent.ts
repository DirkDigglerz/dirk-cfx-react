import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
/**
 * Vite's shapes, described locally rather than imported.
 *
 * Adding vite as a dependency of a RUNTIME library to type a build-time helper
 * would put a bundler in every consumer's install. TypeScript is structural, so
 * these fit where vite's own types are expected.
 */
type Plugin = {
  name: string;
  enforce?: 'pre' | 'post';
  buildStart?: () => void | Promise<void>;
  resolveId?: (id: string) => string | null;
  load?: (id: string) => { code: string; moduleSideEffects?: boolean } | null;
};

type UserConfig = {
  plugins?: unknown[];
  publicDir?: string | false;
  resolve?: { alias?: Record<string, string> };
  define?: Record<string, string>;
  build?: Record<string, unknown>;
};

/**
 * Build a custom Script Studio control.
 *
 * A resource can supply its own editor for a setting — declared in its schema
 * as `x-component` — and Script Studio imports it at runtime from
 * `nui://<resource>/web/build/studio/<name>.js`, rendering it inside the
 * panel's own React tree.
 *
 * The COMPONENT is ordinary React. The BUILD is not, and every resource would
 * otherwise solve the same four problems by hand:
 *
 *   1. The panel's React must be shared. Two copies on one page breaks hooks,
 *      and two react-leaflets means `useMap()` reads a different context and
 *      returns null — a white panel rather than an error.
 *   2. Marking those packages `external` is not enough: it leaves bare
 *      `import ... from "react"` in an ES module, and a browser has no module
 *      resolver to satisfy it. Each has to be ALIASED to a shim that re-exports
 *      from the global the panel provides.
 *   3. A shim has to NAME what it re-exports, because ES module exports are
 *      static — you cannot star-export a runtime object. So the names are read
 *      from each package at build time; hand-written lists drift and are wrong
 *      in ways nobody predicts (`forwardRef`, `PureComponent`).
 *   4. `process.env.NODE_ENV` left in the output kills the file on its first
 *      line in a browser.
 *
 * Usage — the whole config:
 *
 *   import { defineConfig } from 'vite';
 *   import { studioComponent } from 'dirk-cfx-react/vite';
 *
 *   export default defineConfig(studioComponent({
 *     entry: { 'places-map': 'src/components/Studio/PlacesMap.tsx' },
 *   }));
 *
 * Then declare it in your schema:
 *
 *   "places": { "x-component": "web/build/studio/places-map.js" }
 *
 * The component default-exports a function taking `{ value, onChange, canEdit }`.
 */

/** Props every Script Studio control receives. */
export type StudioComponentProps<T = unknown> = {
  /** the setting's current value, including anything staged but unsaved */
  value: T;
  /** stage a new value — counted by the save bar, undoable, saved on Save */
  onChange: (next: T) => void;
  /** false when the viewer has read-only access, or a master switch is off */
  canEdit: boolean;
};

/**
 * Packages the panel puts on `window.__dirkStudio`.
 *
 * This list is the contract, and it lives here because BOTH sides depend on
 * this package: dirk_lib serves them, a component consumes them. Keeping two
 * copies is how react-dom and react-leaflet each went missing for a day.
 *
 * What matters is anything holding React CONTEXT. Everything else a component
 * imports is bundled normally.
 */
export const STUDIO_SHARED = [
  'react',
  'react/jsx-runtime',
  'react/jsx-dev-runtime',
  'react-dom',
  '@mantine/core',
  'dirk-cfx-react',
  'framer-motion',
  'react-leaflet',
  'leaflet',
  'lucide-react',
] as const;

/** Legal object keys that are illegal as an export binding. */
const RESERVED = new Set([
  'default', 'class', 'function', 'const', 'let', 'var', 'return', 'new',
  'delete', 'typeof', 'in', 'of', 'do', 'if', 'else', 'switch', 'case',
  'break', 'continue', 'for', 'while', 'try', 'catch', 'finally', 'throw',
  'import', 'export', 'extends', 'super', 'this', 'null', 'true', 'false',
  'void', 'with', 'yield', 'await', 'enum',
]);

/**
 * Export names for packages neither introspection route can reach.
 *
 * react-leaflet locks `require.resolve` out with an `exports` map and cannot be
 * imported in Node either — it loads leaflet, which touches `window` on sight.
 */
const FALLBACK_NAMES: Record<string, string[]> = {
  'react-leaflet': [
    'MapContainer', 'TileLayer', 'Marker', 'Popup', 'Tooltip', 'Circle',
    'CircleMarker', 'Polyline', 'Polygon', 'Rectangle', 'ImageOverlay',
    'VideoOverlay', 'SVGOverlay', 'LayerGroup', 'FeatureGroup', 'GeoJSON',
    'LayersControl', 'ScaleControl', 'ZoomControl', 'AttributionControl',
    'Pane', 'useMap', 'useMapEvent', 'useMapEvents', 'useLeafletContext',
    'createLeafletContext', 'LeafletProvider', 'LeafletContext',
  ],
};

const require_ = createRequire(import.meta.url);

/**
 * Where this package is installed.
 *
 * `require.resolve('dirk-cfx-react/package.json')` fails from inside the
 * package itself under pnpm's strict layout - a package's own node_modules does
 * not contain a link to itself. This file knows where it is, so walk up from it
 * instead of asking the resolver.
 */
function selfPackageDir(): string | null {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 6; i += 1) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return null;
}

/** Export names read out of a package's ESM build, for ones Node cannot load. */
function exportsFromSource(pkg: string): string[] {
  try {
    // This package cannot resolve itself by name; it can read where it lives.
    const dir = pkg === 'dirk-cfx-react'
      ? selfPackageDir()
      : path.dirname(require_.resolve(`${pkg}/package.json`));
    if (!dir) return [];
    const meta = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    // Prefer an ESM build sitting in dist/. leaflet's `main` is the UMD
    // bundle, which contains no `export {}` at all — parsing that finds
    // nothing and every named import then fails at build time.
    const distDir = path.join(dir, 'dist');
    const esm = fs.existsSync(distDir)
      ? fs.readdirSync(distDir).find((f) => f.endsWith('.esm.js'))
      : undefined;
    const entry = esm
      ? path.join('dist', esm)
      : (meta.module ?? meta.exports?.['.']?.import ?? meta.main);
    if (!entry) return [];

    const src = fs.readFileSync(path.join(dir, entry), 'utf8');
    const found = new Set<string>();
    for (const block of src.matchAll(/export\s*\{([^}]*)\}/g)) {
      for (const part of block[1].split(',')) {
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        if (name && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) && !RESERVED.has(name)) {
          found.add(name);
        }
      }
    }
    return [...found];
  } catch {
    return [];
  }
}

/** Names the component sources actually import from one package. */
function importedNames(dirs: string[], pkg: string): string[] {
  const found = new Set<string>();
  const pattern = new RegExp(
    String.raw`import\s*\{([^}]*)\}\s*from\s*['"]` + pkg + String.raw`['"]`, 'g');

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!/\.tsx?$/.test(file)) continue;
      const src = fs.readFileSync(path.join(dir, file), 'utf8');
      for (const m of src.matchAll(pattern)) {
        for (const part of m[1].split(',')) {
          const name = part.trim().split(/\s+as\s+/)[0].trim();
          if (name) found.add(name);
        }
      }
    }
  }
  return [...found];
}

function sharedDepsPlugin(sourceDirs: string[]): Plugin {
  const VIRTUAL = '\0dirk-studio-shim:';
  const names = new Map<string, string[]>();

  return {
    name: 'dirk-studio-shared-deps',
    enforce: 'pre',

    async buildStart() {
      for (const pkg of STUDIO_SHARED) {
        // lucide-react exports about fifteen hundred icons. Re-exporting all of
        // them puts fifteen hundred string literals in the file whether or not
        // rollup drops the bindings, which is most of the bundle. Expose only
        // what the source actually imports.
        if (pkg === 'lucide-react') {
          names.set(pkg, importedNames(sourceDirs, pkg));
          continue;
        }
        try {
          const mod: Record<string, unknown> = await import(pkg);
          // The identifier test is not paranoia: a CJS package interops with a
          // literal "module.exports" key, which is a fine object property and a
          // syntax error as an export name.
          names.set(pkg, Object.keys(mod).filter(
            (k) => k !== 'default' && /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) && !RESERVED.has(k),
          ));
        } catch {
          const parsed = exportsFromSource(pkg);
          names.set(pkg, parsed.length ? parsed : (FALLBACK_NAMES[pkg] ?? []));
        }
      }
    },

    resolveId(id: string) {
      return (STUDIO_SHARED as readonly string[]).includes(id) ? VIRTUAL + id : null;
    },

    load(id: string) {
      if (!id.startsWith(VIRTUAL)) return null;
      const pkg = id.slice(VIRTUAL.length);
      const exported = names.get(pkg) ?? [];

      const lines = [
        'const shared = globalThis.__dirkStudio;',
        `if (!shared) throw new Error('studio component loaded outside Script Studio');`,
        `const mod = shared[${JSON.stringify(pkg)}];`,
        `if (!mod) throw new Error('Script Studio does not share ${pkg}');`,
        'export default mod.default ?? mod;',
        // Guarded per name: the panel's copy may be a different minor than
        // ours, and a missing export should be undefined rather than a crash
        // while the module is still evaluating.
        //
        // Plain property reads, NOT a helper call: `export const X = get('X')`
        // is a call rollup cannot prove side-effect free, so it keeps every one
        // — 186kB for a file using thirteen icons. A direct read from a module
        // declared side-effect-free tree-shakes to what is used.
        ...exported.map((n) => `export const ${n} = mod[${JSON.stringify(n)}];`),
      ];

      return { code: lines.join('\n'), moduleSideEffects: false };
    },
  };
}

export type StudioComponentOptions = {
  /**
   * Entry points, as `{ '<output-name>': '<source path>' }`. The output name
   * is what appears in `x-component`, so keep it stable.
   */
  entry: Record<string, string>;
  /** where the build lands (default `build/studio`, relative to the web root) */
  outDir?: string;
  /** extra plugins, e.g. `@vitejs/plugin-react` */
  plugins?: UserConfig['plugins'];
  /** path aliases your sources use */
  alias?: Record<string, string>;
  /** project root, defaults to cwd */
  root?: string;
};

/**
 * A complete vite config for building Script Studio components.
 *
 * Spread it, or pass it straight to `defineConfig`.
 */
export function studioComponent(options: StudioComponentOptions): UserConfig {
  const root = options.root ?? process.cwd();
  const entry = Object.fromEntries(
    Object.entries(options.entry).map(([name, file]) => [name, path.resolve(root, file)]),
  );
  const sourceDirs = [...new Set(Object.values(entry).map((f) => path.dirname(f)))];

  return {
    plugins: [sharedDepsPlugin(sourceDirs), ...(options.plugins ?? [])],
    // Your resource's public/ belongs to its own bundle, not to a control the
    // settings panel imports. Without this every wallpaper and icon is copied
    // into the studio output too.
    publicDir: false,
    resolve: options.alias
      ? { alias: Object.fromEntries(
        Object.entries(options.alias).map(([k, v]) => [k, path.resolve(root, v)])) }
      : undefined,
    // A browser has no `process`. Any React-adjacent toolchain leaves this
    // reference in unless told otherwise, and the file then dies on its first
    // line with "process is not defined".
    define: { 'process.env.NODE_ENV': '"production"' },
    build: {
      outDir: options.outDir ?? 'build/studio',
      emptyOutDir: true,
      target: 'es2020',
      lib: {
        entry,
        formats: ['es'],
        fileName: (_format: string, name: string) => `${name}.js`,
      },
      // No hashes: the path is named in schema.json, so it has to be stable.
      rollupOptions: {
        output: { entryFileNames: '[name].js', chunkFileNames: '[name].js' },
      },
    },
  };
}
