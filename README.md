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
import {
    Tabs,
    type TabsIcon,
    type TabsItem,
} from "react-native-jelly-tabs";
import { View } from "react-native";

const HomeIcon: TabsIcon = ({ color, isSelected, size }) => (
    <MaterialIcons
        color={color}
        name="home"
        size={isSelected ? size + 2 : size}
    />
);

const items: TabsItem[] = [
    {
        key: "home",
        label: "Home",
        icon: HomeIcon,
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

Each item's `icon` is a render function. It receives the resolved `color`, `size`, `opacity`, full `colors` palette, `isSelected`, and `isMasked`, so an icon can use a different glyph or structure for the selected layer instead of relying on element cloning.

`onTabChange` runs on the JavaScript thread after the gesture finishes and the selected tab actually changes. Its event contains both `index` and the original `item`; tapping the already selected tab does not emit it.

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

Don't be afraid to open issues or Pull Requests :)
