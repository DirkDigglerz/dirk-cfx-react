# dirk-cfx-react

A modular **React + TypeScript** component library for **FiveM** and **RedM** UI development.  
Includes pre-styled Mantine components, hooks, and utilities optimized for CFX frameworks.

[![npm version](https://img.shields.io/npm/v/dirk-cfx-react.svg)](https://www.npmjs.com/package/dirk-cfx-react)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TS-TypeScript-blue)](https://www.typescriptlang.org/)

---

## 🚀 Installation

```bash
pnpm add dirk-cfx-react
# or
npm install dirk-cfx-react
```

---

## 🧩 Usage

### Core Provider

Wrap your app in the `DirkProvider` to apply Mantine theming and base settings.

```tsx
import { DirkProvider } from "dirk-cfx-react";

export default function App() {
  return (
    <DirkProvider>
      <YourApp />
    </DirkProvider>
  );
}
```

### Using a Hook

```tsx
import { useNuiEvent } from "dirk-cfx-react/hooks";

function Example() {
  const data = useNuiEvent("eventName");
  return <div>{JSON.stringify(data)}</div>;
}
```

### Using a Component

```tsx
import { SegmentedControl } from "dirk-cfx-react";

export function Example() {
  return (
    <SegmentedControl
      segments={[
        { label: "Tab 1", value: "1" },
        { label: "Tab 2", value: "2" },
      ]}
      value="1"
    />
  );
}
```

---

## 📦 Features

- ✅ Full **TypeScript** support with auto-completion  
- 🎨 Pre-configured **Mantine 8** theming and notifications  
- ⚡ Lightweight, bundled via **tsup**  
- 🔗 Modular import paths:
  - `dirk-cfx-react/hooks`
  - `dirk-cfx-react/utils`
  - `dirk-cfx-react/components`
  - `dirk-cfx-react/providers`
- 📁 Ships CSS, fonts, and static assets needed by components

---

## 🧰 Peer Dependencies

Install these in your app for best compatibility:

- `react` ^19  
- `react-dom` ^19  
- `@mantine/core` ^8  
- `@mantine/notifications` ^8  
- `@fortawesome/react-fontawesome` ^3  
- `@fortawesome/fontawesome-svg-core` ^7  
- `@fortawesome/free-solid-svg-icons` ^7  
- `@fortawesome/free-regular-svg-icons` ^7  
- `@fortawesome/free-brands-svg-icons` ^7  
- `framer-motion` ^12  
- `zustand` ^5

---

## 🛠️ Local Development

```bash
git clone https://github.com/DirkDigglerz/dirk-cfx-react.git
cd dirk-cfx-react
pnpm install

# Build the library
pnpm build

# (Optional) link locally
pnpm link --global
# In your consumer project:
pnpm link dirk-cfx-react
```

---

## 🗺️ Import Paths

- Root (core): `dirk-cfx-react`  
- Hooks: `dirk-cfx-react/hooks`  
- Utils: `dirk-cfx-react/utils`  
- Components: `dirk-cfx-react/components`  
- Providers: `dirk-cfx-react/providers`

> Tip: If you prefer strict sub-path imports only, avoid re-exporting from the root in your own code.

---

## 📜 License

**MIT License** © DirkScripts

---

## 💬 Notes

This package is part of the **DirkScripts** ecosystem for FiveM/RedM React-based UI projects. Contributions and issues welcome!