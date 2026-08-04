# oh-my-tabs

A jelly-like animated tab bar for React Native, built with Reanimated, Gesture Handler and Masked View

https://github.com/user-attachments/assets/51101532-fdac-44bb-9ad0-e75f9c3b0171

Demo at: https://jelly.felipe.software/

!! Still under development !!

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
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
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
        <View style={{ height: 68, width: "100%" }}>
            <Tabs
                items={items}
                colors={{
                    surface: "#22211F",
                    selectedSurface: "#F2EEE7",
                    activeContent: "#11100F",
                    inactiveContent: "#B8B4AD",
                }}
                opacity={{
                    surface: 0.78,
                    selectedSurface: 0.86,
                }}
                config={{
                    layout: { trackHeight: 68 },
                    pillJelly: { pressedScale: 1.25 },
                    distortion: {
                        verticalDrag: { distortion: 0.1 },
                    },
                }}
            />
        </View>
    );
}
```

`colors` accepts solid React Native color strings for the track, selected pill, active content, and inactive content. Partial color objects fall back to the built-in palette.

`opacity` controls those same four layers independently and is clamped from `0` to `1`. Opacity is applied to the rendered content rather than the mask, so the animated pill keeps a fully opaque clipping shape.

Every value from `TABBAR_LAYOUT`, `PILL_JELLY`, and `DISTORTION` can be overridden through the deep-partial `config` prop. `resolveTabBarConfig()` is exported when a consumer needs a complete mutable configuration object.

`backdrop` and `selectedBackdrop` accept React nodes rendered below the track and selected-pill color layers. This keeps blur provider-agnostic: the Expo example uses `expo-blur`, while other apps can inject their platform blur component.

The touch feedback color follows `colors.selectedSurface` by default. Set `touchFeedbackColor` to override it independently.

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
