# react-native-jelly-tabs

A jelly-like animated tab bar for React Native, built with Reanimated, Gesture Handler and Masked View

<video src="https://github.com/user-attachments/assets/51101532-fdac-44bb-9ad0-e75f9c3b0171" autoplay muted controls></video>

Demo at: https://jelly.felipe.software/

> !! Still under development !!
> This project is kinda focused on Android, but technically you can use it on web and iOS too

## Installation

```sh
npm install react-native-jelly-tabs
```

##### Dependencies

Using Expo install
```sh
npx expo install @react-native-masked-view/masked-view react-native-gesture-handler react-native-reanimated react-native-svg
```

Without expo install
```sh
npm install @react-native-masked-view/masked-view react-native-gesture-handler react-native-reanimated react-native-svg
``` 


Then rebuild the native app — `npx expo prebuild` on Expo, or `pod install` + a fresh build on bare React Native. Aside from that command, Expo and bare React Native are identical here.

<details>
<summary>Reanimated & Gesture Handler setup</summary> 

**React Native Gesture Handler v2** needs extra steps to finalize its [installation instructions](https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation). 
Please **make sure** to wrap your App with `GestureHandlerRootView` when you've upgraded to React Native Gesture Handler ^2.

**React Native Reanimated v3** needs extra steps to finalize its installation: [installation instructions](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started).
</details>

### Compatible versions

Jelly Tabs works across a couple of major versions of each native dependency, so you can match whatever your app already uses:

| Package | Supported range |
| --- | --- |
| React Native | `>=0.76` |
| Gesture Handler | `>=2.25 <4` (Gesture Handler 3 needs React Native `>=0.82`) |
| Reanimated | `>=3.16 <5` |

These ranges describe the APIs Jelly Tabs uses. Your app's framework may pin a narrower version inside them — for example Expo SDK 57 recommends Gesture Handler `~2.32.0` — so prefer the version your framework recommends (`npx expo install` picks it for you) when it falls within the range above.

### Icons

Any component works as icons, since an icon is just a render function you provide (an SVG, an `expo-image`, an emoji `<Text>`, …). To use that specific library, install it and follow its own native setup (font linking on bare React Native, its config plugin on Expo):
The snippets below use `@react-native-vector-icons/material-icons`.

## Usage with Expo Router or React Navigation

```tsx
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Tabs } from "expo-router";
import { JellyTabBar } from "react-native-jelly-tabs";

export default function TabLayout() {
    return (
        <Tabs tabBar={(props) => <JellyTabBar {...props} floating />}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons color={color} name="home" size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons color={color} name="settings" size={size} />
                    ),
                }}
            />
        </Tabs>
    );
}
```

`JellyTabBar` is compatible with the `tabBar` prop from Expo Router's JavaScript tabs and React Navigation's bottom tabs. It reads the screens, labels, icons and selected index from the navigator, emits the standard `tabPress` event and keeps the pill synchronized with deep links, hardware back and programmatic navigation.

Both components have a `maxWidth` of `400` by default and stay centered on wider screens. Override it with a number or dimension value, for example `<JellyTabBar {...props} maxWidth={560} />` or `maxWidth="100%"`.

Pass `floating` to position the bar over the screen instead of reserving layout space. The screen will then fill behind the bar. Scrollable screens should add enough bottom content padding for their last item to remain reachable above the floating bar.

### Router-independent component

Use `JellyTabBarHeadless` when you want the animated component without any navigation integration:

```tsx
<JellyTabBarHeadless
    items={items}
    selectedIndex={selectedIndex}
    onTabPress={({ index }) => setSelectedIndex(index)}
/>
```

Each item takes an `activeIcon` and an `inactiveIcon` render function (each receives `color`, `size`, `opacity` and the full `colors` palette). `selectedIndex` is optional; omit it for uncontrolled usage. The old `JellyTabs` export remains as a deprecated alias for `JellyTabBarHeadless`.

`JellyTabBarHeadless` adds no safe-area inset of its own. Give it a wrapper whose height matches `config.layout.trackHeight` (default `64`) times `displayScale`. The navigation-aware `JellyTabBar` handles the navigator-provided safe-area insets automatically.

Colors, opacity, layout, jelly springs, distortion, backdrops and touch feedback are all configurable. See **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** for every prop and config value.

## Development

The reusable package lives in `src/`. The Expo playground, generated background, and color laboratory live in `example/`.

```sh
bun install
bun run build
bun run example:web
```

Other useful commands:

```sh
bun run dev
bun run typecheck
bun run example:android
bun run example:ios
```

Don't be afraid to open issues or Pull Requests, especially for documentation! :)
