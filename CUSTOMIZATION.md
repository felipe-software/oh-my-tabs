# Customization

Every adjustable parameter of `<JellyTabBarHeadless />`, taken straight from the exported TypeScript types. All props are optional except `items`; anything you omit falls back to the built-in defaults. `JellyTabBar` accepts the same visual props while sourcing its items and selection from React Navigation or Expo Router.

## `<JellyTabBarHeadless />` props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `items` | `TabsItem[]` | — | The tabs to render (required). |
| `maxWidth` | `DimensionValue` | `400` | Maximum track width. The bar stays centered inside wider parents. |
| `selectedIndex` | `number \| null` | uncontrolled | Controlled selected index. External changes animate the pill to the matching item. Pass `null` or a negative index to render no selected pill. |
| `onTabPress` | `(event: TabsChangeEvent) => boolean \| void` | — | Runs after every completed tap or drag, including the already selected tab. Return `false` to reject the change and restore the current selection. |
| `onTabLongPress` | `(event: TabsChangeEvent) => void` | — | Runs when a tab is held, including the `longpress` accessibility action. |
| `onTabChange` | `(event: TabsChangeEvent) => void` | — | Runs after an accepted gesture changes the selected tab. Rejected presses and taps on the already selected tab do not emit it. |
| `colors` | `Partial<TabBarColors>` | built-in palette | Solid color strings for each layer. See [Colors](#colors). |
| `opacity` | `Partial<TabBarOpacity>` | all `1` | Per-layer opacity, clamped `0`–`1`. See [Opacity](#opacity). |
| `config` | `DeepPartial<TabBarConfig>` | see [Config](#config) | Deep-partial override of layout, jelly and distortion. |
| `backdrop` | `ReactNode` | — | Node rendered below the track color layer (e.g. a blur view). |
| `selectedBackdrop` | `ReactNode` | — | Node rendered below the selected-pill color layer. |
| `displayScale` | `number` | `1` | Scales every layout dimension (useful for recordings/thumbnails). |
| `touchFeedbackEnabled` | `boolean` | `true` | Toggles the radial touch feedback. |
| `touchFeedbackColor` | `string` | `colors.selectedSurface` | Overrides the touch feedback color. |
| `touchFeedbackOpacity` | `number` | `distortion.touchFeedback.opacity` | Overrides the touch feedback opacity. |
| `touchFeedbackScale` | `number` | `distortion.touchFeedback.scale` | Overrides the touch feedback radius scale. |
| `recording` | `boolean` | `false` | Deterministic mode for capturing clean recordings. |

`JellyTabs` remains available as a deprecated alias for `JellyTabBarHeadless`.

## `<JellyTabBar />` navigation props

Pass `JellyTabBar` directly to the navigator's `tabBar` callback. The navigator supplies `state`, `descriptors`, `navigation` and `insets`; do not pass them manually.

```tsx
<Tabs tabBar={(props) => <JellyTabBar {...props} />} />
```

It supports Expo Router's `href: null` convention for hidden tabs, plus `title`, string `tabBarLabel`, `tabBarLabelStyle`, `tabBarIcon`, `tabBarShowLabel`, `tabBarBadge`, `tabBarBadgeStyle`, `tabBarAccessibilityLabel`, `tabBarButtonTestID`, active/inactive tint and background colors, `tabBarBackground`, `tabBarStyle`, `tabPress` and `tabLongPress`. The centered bar has `maxWidth={400}` by default; change it with the `maxWidth` prop. Pass `floating` to absolutely position the bar over the screen, and use `containerStyle` for additional wrapper overrides. Function-valued `tabBarLabel` and custom tab buttons are not currently rendered by the Jelly layout.

### `TabsItem`

```ts
interface TabsItem {
    accessibilityLabel?: string;
    key: string;
    label: string;
    labelStyle?: StyleProp<TextStyle>;
    activeIcon: TabsIcon; // shown through the pill mask
    inactiveIcon: TabsIcon; // shown in the track
    badge?: number | string;
    badgeStyle?: StyleProp<TextStyle>;
    testID?: string;
}
```

Labels are limited to one line and truncate with a trailing ellipsis. Each item is exposed to accessibility services as a tab with its label and selected state; the semantic layer supports activate and long-press actions without replacing the continuous drag gesture.

### `TabsChangeEvent`

```ts
interface TabsChangeEvent {
    index: number;
    item: TabsItem;
}
```

## Icons

Each item supplies two render functions (`TabsIcon`): `inactiveIcon` is drawn in the track, and `activeIcon` is revealed through the animated pill mask. Because they are separate components, an icon can use a completely different glyph or structure for the selected state. Both receive:

```ts
interface TabsIconProps {
    color: string; // resolved active/inactive content color
    colors: Readonly<TabBarColors>; // full palette
    size: number; // resolved icon size
    opacity: number; // resolved layer opacity
}
```

## Colors

`colors` accepts solid React Native color strings. Partial objects merge over the defaults.

```ts
interface TabBarColors {
    surface: string; // track background
    selectedSurface: string; // selected pill
    activeContent: string; // selected icon/label
    inactiveContent: string; // unselected icon/label
}
```

| Key | Default |
| --- | --- |
| `surface` | `#22211f` |
| `selectedSurface` | `#f2eee7` |
| `activeContent` | `#11100f` |
| `inactiveContent` | `#b8b4ad` |

## Opacity

`opacity` controls those same four layers independently and is clamped from `0` to `1`. Opacity is applied to the rendered content rather than the mask, so the animated pill keeps a fully opaque clipping shape.

```ts
interface TabBarOpacity {
    surface: number;
    selectedSurface: number;
    activeContent: number;
    inactiveContent: number;
}
```

All four default to `1`.

## Config

`config` is a deep-partial override of `TabBarConfig`, so you only pass the nested keys you want to change:

```ts
interface TabBarConfig {
    layout: TabBarLayoutConfig;
    pillJelly: PillJellyConfig;
    distortion: DistortionConfig;
}
```

`resolveTabBarConfig(partial?)` is exported when you need a complete, mutable configuration object.

### `layout`

```ts
interface TabBarLayoutConfig {
    iconSize: number;
    itemHeight: number;
    trackHeight: number;
    trackInset: number;
    maskOverscanX: number;
    maskOverscanY: number;
}
```

| Key | Default | Description |
| --- | --- | --- |
| `iconSize` | `28` | Base icon size passed to each `icon`. |
| `itemHeight` | `56` | Height of a single tab / the selected pill. |
| `trackHeight` | `64` | Height of the track. |
| `trackInset` | `4` | Padding between the track edge and items. |
| `maskOverscanX` | `48` | Horizontal overscan for the pill mask. |
| `maskOverscanY` | `16` | Vertical overscan for the pill mask. |

### `pillJelly`

```ts
interface PillJellyConfig {
    pressedScale: number;
    snapOnPointerDown: boolean;
    frameConfig: {
        releaseDistanceFraction: number;
        springs: Record<
            "panel" | "press" | "scaleX" | "scaleY" | "value" | "velocity",
            { stiffness: number; dampingRatio: number }
        >;
    };
}
```

| Key | Default | Description |
| --- | --- | --- |
| `pressedScale` | `1.3` | How much the pill inflates while pressed. |
| `snapOnPointerDown` | `true` | Snap the indicator toward the touch immediately on press. |
| `frameConfig.releaseDistanceFraction` | `0.025` | Keeps the indicator inflated until it is within this fraction of its snap point. |
| `frameConfig.springs.*` | see below | Per-channel spring `{ stiffness, dampingRatio }`. |

Default springs:

| Spring | `stiffness` | `dampingRatio` |
| --- | --- | --- |
| `panel` | `300` | `1` |
| `press` | `1000` | `1` |
| `scaleX` | `250` | `0.6` |
| `scaleY` | `250` | `0.7` |
| `value` | `1000` | `1` |
| `velocity` | `300` | `0.5` |

### `distortion`

```ts
interface DistortionConfig {
    pressedScale: number;
    touchFeedback: {
        opacity: number;
        middleOpacityRatio: number;
        radius: number;
        scale: number;
    };
    spring: { damping: number; mass: number; stiffness: number };
    verticalDrag: {
        distortion: number;
        distanceForMaxDistortion: number;
        follow: number;
        rubberBand: number;
    };
}
```

| Key | Default | Description |
| --- | --- | --- |
| `pressedScale` | `1.025` | Whole-track scale while pressed. |
| `touchFeedback.opacity` | `0.15` | Base opacity of the radial touch feedback. |
| `touchFeedback.middleOpacityRatio` | `0.43` | Opacity of the gradient's middle stop, relative to the base. |
| `touchFeedback.radius` | `150` | Base touch feedback radius (px). |
| `touchFeedback.scale` | `2` | Multiplier applied to the radius. |
| `spring.damping` | `18` | Distortion spring damping. |
| `spring.mass` | `0.9` | Distortion spring mass. |
| `spring.stiffness` | `240` | Distortion spring stiffness. |
| `verticalDrag.distortion` | `0.08` | How much vertical drag squishes the track width. |
| `verticalDrag.distanceForMaxDistortion` | `700` | Drag distance (px) that reaches max distortion. |
| `verticalDrag.follow` | `0.25` | How much the track follows the finger vertically. |
| `verticalDrag.rubberBand` | `0.14` | Rubber-band resistance on the vertical follow. |

## Backdrops

`backdrop` and `selectedBackdrop` accept React nodes rendered below the track and selected-pill color layers. This keeps blur provider-agnostic: the Expo example uses `expo-blur`, while other apps can inject their platform blur component.

## Touch feedback

The touch feedback color follows `colors.selectedSurface` by default. Set `touchFeedbackColor` to override it independently, and use `touchFeedbackOpacity` / `touchFeedbackScale` to tune it, or `touchFeedbackEnabled={false}` to turn it off.
