# react-native-jelly-tabs

A jelly-like animated tab bar for React Native, built with Reanimated, Gesture Handler and Masked View

https://github.com/user-attachments/assets/51101532-fdac-44bb-9ad0-e75f9c3b0171

Demo at: https://jelly.felipe.software/

!! Still under development !!
This project is kinda focused on Android, but technically you can use it on web and iOS too

## How to install

```sh
npm install react-native-jelly-tabs
```

That's it. Just prebuild your project and make sure your app is wrapped in `GestureHandlerRootView` and follow the Reanimated setup for the major version you end up with.

### Compatible versions

Jelly Tabs works across a couple of major versions of each native dependency, so you can match whatever your app already uses:

| Package | Supported range |
| --- | --- |
| React Native | `>=0.76` |
| Gesture Handler | `>=2.25 <4` (Gesture Handler 3 needs React Native `>=0.82`) |
| Reanimated | `>=3.16 <5` |

With Reanimated 4 also install `react-native-worklets`; with Reanimated 3 you don't.

## Usage

```tsx
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Tabs, type TabsItem } from "react-native-jelly-tabs";
import { View } from "react-native";

const items: TabsItem[] = [
    {
        key: "home",
        label: "Home",
        icon: ({ color, size }) => (
            <MaterialIcons color={color} name="home" size={size} />
        ),
    },
    {
        key: "settings",
        label: "Settings",
        icon: ({ color, size }) => (
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
        <View style={{ height: 68, width: "100%" }}>
            <Tabs
                items={items}
                onTabChange={({ item }) => onNavigate(item.key)}
            />
        </View>
    );
}
```

Each item's `icon` is a render function that receives `color`, `size`, `isSelected` and more. `onTabChange` fires when the selected tab actually changes.

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

Don't be afraid to open issues or Pull Requests :)
