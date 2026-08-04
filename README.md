# oh-my-tabs

A jelly-like animated tab bar for React Native, built with Reanimated and Gesture Handler.

https://github.com/user-attachments/assets/16cdf749-7f98-4f97-857b-10bfd2a0d79d

## Install

```sh
bun add oh-my-tabs \
  @react-native-masked-view/masked-view \
  react-native-gesture-handler \
  react-native-reanimated \
  react-native-svg
```

The package expects Gesture Handler and Reanimated to be configured in the consuming app.

## Usage

```tsx
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import { Tabs, type TabsItem } from "oh-my-tabs";
import { View } from "react-native";

const items: TabsItem[] = [
    {
        key: "home",
        label: "Home",
        icon: <MaterialIcons name="home" size={28} />,
    },
    {
        key: "settings",
        label: "Settings",
        icon: <MaterialIcons name="settings" size={28} />,
    },
];

export function BottomTabs() {
    return (
        <View style={{ height: 64, width: "100%" }}>
            <Tabs
                items={items}
                colors={{
                    surface: "#22211F",
                    selectedSurface: "#F2EEE7",
                    activeContent: "#11100F",
                    inactiveContent: "#B8B4AD",
                }}
            />
        </View>
    );
}
```

`colors` accepts solid React Native color strings for the track, selected pill, active content, and inactive content. Partial color objects fall back to the built-in palette.

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
