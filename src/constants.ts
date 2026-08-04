import type { PillJellyFrameConfig } from "./utils/pill-jelly-animation";

export const TABBAR_LAYOUT = {
    iconSize: 28,
    itemHeight: 56,
    maskOverscanX: 48,
    maskOverscanY: 16,
    trackHeight: 64,
    trackInset: 4,
} as const;

export interface TabBarColors {
    activeContent: string;
    inactiveContent: string;
    selectedSurface: string;
    surface: string;
}

export const DEFAULT_TAB_BAR_COLORS: TabBarColors = {
    activeContent: "#11100f",
    inactiveContent: "#b8b4ad",
    selectedSurface: "#f2eee7",
    surface: "#22211f",
};

export const PILL_JELLY = {
    pressedScale: 1.3,
    snapOnPointerDown: true,
    frameConfig: {
        // Keep the indicator inflated until it is within 2.5% of its snap point.
        releaseDistanceFraction: 0.025,
        springs: {
            panel: { stiffness: 300, dampingRatio: 1 },
            press: { stiffness: 1_000, dampingRatio: 1 },
            scaleX: { stiffness: 250, dampingRatio: 0.6 },
            scaleY: { stiffness: 250, dampingRatio: 0.7 },
            value: { stiffness: 1_000, dampingRatio: 1 },
            velocity: { stiffness: 300, dampingRatio: 0.5 },
        },
    } as const satisfies PillJellyFrameConfig,
} as const;

export const DISTORTION = {
    pressedScale: 1.025,
    touchFeedback: {
        middleOpacityRatio: 0.43,
        opacity: 0.15,
        radius: 150,
        scale: 2,
    },
    spring: {
        damping: 18,
        mass: 0.9,
        stiffness: 240,
    },
    verticalDrag: {
        distortion: 0.08,
        distanceForMaxDistortion: 700,

        // Movement only: these change how much the tabbar follows the finger,
        // without changing its width distortion.
        follow: 0.25,
        rubberBand: 0.28 / 2,
    },
} as const;
