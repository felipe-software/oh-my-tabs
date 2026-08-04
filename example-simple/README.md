# Simple example

A minimal Expo app with three pages (`Home`, `Search`, `Profile`) driven by **Expo Router**, using `JellyTabs` as the custom bottom tab bar.

## How it works

`app/_layout.tsx` renders Expo Router's `<Tabs>` layout with a custom `tabBar`:

```tsx
<Tabs tabBar={(props) => <JellyTabBar {...props} />}>
  <Tabs.Screen name="index" />
  <Tabs.Screen name="search" />
  <Tabs.Screen name="profile" />
</Tabs>
```

`src/JellyTabBar.tsx` renders `JellyTabs` and, on `onTabChange`, calls `navigation.navigate(route.name)` — so the router owns the routes (URLs, deep links, back button) while the bar drives the animation. The item `key`s match the route names.

> Jelly Tabs is uncontrolled: the pill follows taps on the bar. Navigating from somewhere other than the bar (a deep link, hardware back) changes the route but does not move the pill.

## Run

This example consumes the library from its **build (`dist/`)** through a Bun symlink (`bun link`) — no root copy, no tarball. First time, from the **repository root**:

```sh
bun install
bun run build      # generate dist/
bun link           # register react-native-jelly-tabs as a global Bun link
```

Then, inside `example-simple/`:

```sh
bun install        # resolves "link:react-native-jelly-tabs" (symlink → built dist)
bun run start      # or: bun run android / ios / web
```

## Why it doesn't duplicate the library

`package.json` references the library as `"react-native-jelly-tabs": "link:react-native-jelly-tabs"`. Bun creates a **symlink** to the repository root instead of copying, so the target is only the package files (`file:..` would copy the whole root — `example/`, `references/` — inflating the store by gigabytes).

Because the root `package.json` no longer exposes a `react-native: ./src` field, resolution falls back to `dist/` (the published artifact), just like a real npm consumer. After changing the library, rebuild:

```sh
bun run build      # at the root — or `bun run dev` to watch; the symlink reflects it live
```

The example never imports from `src/` directly: it only consumes the public package name.
