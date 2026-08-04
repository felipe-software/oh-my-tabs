import type { PillJellyFrameConfig } from "./utils/pill-jelly-animation";

export interface TabBarLayoutConfig {
    iconSize: number;
    itemHeight: number;
    maskOverscanX: number;
    maskOverscanY: number;
    trackHeight: number;
    trackInset: number;
}

export const TABBAR_LAYOUT = {
    iconSize: 28,
    itemHeight: 56,
    maskOverscanX: 48,
    maskOverscanY: 16,
    trackHeight: 64,
    trackInset: 4,
} as const satisfies TabBarLayoutConfig;

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

export interface TabBarOpacity {
    activeContent: number;
    inactiveContent: number;
    selectedSurface: number;
    surface: number;
}

export const DEFAULT_TAB_BAR_OPACITY: TabBarOpacity = {
    activeContent: 1,
    inactiveContent: 1,
    selectedSurface: 1,
    surface: 1,
};

export interface PillJellyConfig {
    pressedScale: number;
    snapOnPointerDown: boolean;
    frameConfig: PillJellyFrameConfig;
}

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
    },
} as const satisfies PillJellyConfig;

export interface DistortionConfig {
    pressedScale: number;
    touchFeedback: {
        middleOpacityRatio: number;
        opacity: number;
        radius: number;
        scale: number;
    };
    spring: {
        damping: number;
        mass: number;
        stiffness: number;
    };
    verticalDrag: {
        distortion: number;
        distanceForMaxDistortion: number;
        follow: number;
        rubberBand: number;
    };
}

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
} as const satisfies DistortionConfig;

export interface TabBarConfig {
    distortion: DistortionConfig;
    layout: TabBarLayoutConfig;
    pillJelly: PillJellyConfig;
}

export type DeepPartial<T> = {
    [Key in keyof T]?: T[Key] extends object ? DeepPartial<T[Key]> : T[Key];
};

export const DEFAULT_TAB_BAR_CONFIG: TabBarConfig = {
    distortion: DISTORTION,
    layout: TABBAR_LAYOUT,
    pillJelly: PILL_JELLY,
};

export const resolveTabBarConfig = (
    config?: DeepPartial<TabBarConfig>,
): TabBarConfig => ({
    layout: {
        ...TABBAR_LAYOUT,
        ...config?.layout,
    },
    pillJelly: {
        ...PILL_JELLY,
        ...config?.pillJelly,
        frameConfig: {
            ...PILL_JELLY.frameConfig,
            ...config?.pillJelly?.frameConfig,
            springs: {
                panel: {
                    ...PILL_JELLY.frameConfig.springs.panel,
                    ...config?.pillJelly?.frameConfig?.springs?.panel,
                },
                press: {
                    ...PILL_JELLY.frameConfig.springs.press,
                    ...config?.pillJelly?.frameConfig?.springs?.press,
                },
                scaleX: {
                    ...PILL_JELLY.frameConfig.springs.scaleX,
                    ...config?.pillJelly?.frameConfig?.springs?.scaleX,
                },
                scaleY: {
                    ...PILL_JELLY.frameConfig.springs.scaleY,
                    ...config?.pillJelly?.frameConfig?.springs?.scaleY,
                },
                value: {
                    ...PILL_JELLY.frameConfig.springs.value,
                    ...config?.pillJelly?.frameConfig?.springs?.value,
                },
                velocity: {
                    ...PILL_JELLY.frameConfig.springs.velocity,
                    ...config?.pillJelly?.frameConfig?.springs?.velocity,
                },
            },
        },
    },
    distortion: {
        ...DISTORTION,
        ...config?.distortion,
        touchFeedback: {
            ...DISTORTION.touchFeedback,
            ...config?.distortion?.touchFeedback,
        },
        spring: {
            ...DISTORTION.spring,
            ...config?.distortion?.spring,
        },
        verticalDrag: {
            ...DISTORTION.verticalDrag,
            ...config?.distortion?.verticalDrag,
        },
    },
});
