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

## Usage

```tsx
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { JellyTabs, type TabsItem } from "react-native-jelly-tabs";
import { View } from "react-native";

const items: TabsItem[] = [
    {
        key: "home",
        label: "Home",
        activeIcon: ({ color, size }) => (
            <MaterialIcons color={color} name="home" size={size} />
        ),
        inactiveIcon: ({ color, size }) => (
            <MaterialIcons color={color} name="home" size={size} />
        ),
    },
    {
        key: "settings",
        label: "Settings",
        activeIcon: ({ color, size }) => (
            <MaterialIcons color={color} name="settings" size={size} />
        ),
        inactiveIcon: ({ color, size }) => (
            <MaterialIcons color={color} name="settings" size={size} />
        ),
    },
];

export function BottomTabs({
    onNavigate,
}: {
    onNavigate: (key: string) => void;
}) {
    return (
        <View style={{ height: 64, width: "100%" }}>
            <JellyTabs
                items={items}
                onTabChange={({ item }) => onNavigate(item.key)}
            />
        </View>
    );
}
```

Each item takes an `activeIcon` and an `inactiveIcon` render function (each receives `color`, `size`, `opacity` and the full `colors` palette). Jelly Tabs draws the inactive icons in the track and reveals the active ones through the animated pill mask. `onTabChange` fires when the selected tab actually changes (tapping the already selected tab does not emit it).

### Selection

The first item (`items[0]`) is selected on mount. Selection is driven by user interaction with the bar — there is currently **no controlled `value` prop**, so you keep your own screen state in `onTabChange`, but changing that state elsewhere (a deep link, hardware back) updates your screen without moving the pill. If you need programmatic selection, open an issue.

### Sizing & safe area

Give the bar a wrapper whose height matches `config.layout.trackHeight` (default `64`) times `displayScale` (default `1`). The mask overscan is drawn with `overflow: visible`, so the pill can bulge past the wrapper without being clipped — the wrapper only needs to reserve the track's height. If you change `trackHeight` or `displayScale`, update the wrapper to match.

Jelly Tabs adds **no safe-area inset of its own**. Handle the bottom inset outside the bar — e.g. put it inside a `SafeAreaView` with `edges={["bottom"]}`, or add `paddingBottom` from `useSafeAreaInsets()`.

### With navigation

Keep the displayed screen in sync with the bar by storing the selected key yourself:

```tsx
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { JellyTabs } from "react-native-jelly-tabs";
import { useState } from "react";
import { View } from "react-native";

export default function App() {
    const [screen, setScreen] = useState(items[0].key);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
                <JellyTabs
                    items={items}
                    onTabChange={({ item }) => setScreen(item.key)} // Handle router navigation here
                />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}
```

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
