import { defineConfig } from "tsup";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "components/index": "src/components/index.ts",
    "hooks/index": "src/hooks/index.tsx",
    "utils/index": "src/utils/index.ts",
    "providers/index": "src/providers/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: "es2020",
  external: [
    "react",
    "react-dom",
    "@mantine/core",
    "@mantine/hooks",
    "@mantine/notifications",
    /\.css$/,
  ],
  loader: {
    // Styles
    ".css": "copy",
    ".scss": "copy",

    // Media assets
    ".mp3": "copy",
    ".wav": "copy",
    ".png": "copy",
    ".jpg": "copy",
    ".jpeg": "copy",
    ".svg": "copy",
    ".gif": "copy",

    // Fonts — use file so bundlers emit proper URLs
    ".woff": "file",
    ".woff2": "file",
    ".ttf": "file",
    ".otf": "file",
  },

  esbuildOptions(options) {
    options.alias = {
      "@": path.resolve(__dirname, "src").replace(/\\/g, "/"),
    };
  },

  async onSuccess() {
    const foldersToCopy = [
      "src/styles", // CSS & global styles
      "src/assets", // misc static
      "src/fonts",  // ✅ fonts folder
    ];

    for (const folder of foldersToCopy) {
      const src = path.resolve(__dirname, folder);
      const dest = path.resolve(__dirname, "dist", path.basename(folder));

      if (fs.existsSync(src)) {
        await fs.copy(src, dest);
        console.log(`✅ Copied ${folder} → ${dest}`);
      }
    }

    console.log("🎉 Build complete: styles, assets, and fonts copied successfully!");
  },
});
