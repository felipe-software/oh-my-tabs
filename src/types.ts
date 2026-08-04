import type {
    DeepPartial,
    TabBarColors,
    TabBarConfig,
    TabBarOpacity,
} from "./constants";
import type { ComponentType, ReactNode } from "react";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";

export interface TabsIconProps {
    color: string;
    colors: Readonly<TabBarColors>;
    opacity: number;
    size: number;
}

export type TabsIcon = ComponentType<TabsIconProps>;

export interface TabsItem {
    key: string;
    label: string;
    activeIcon: TabsIcon;
    inactiveIcon: TabsIcon;
}

export interface TabsChangeEvent {
    index: number;
    item: TabsItem;
}

export interface JellyTabBarHeadlessProps {
    backdrop?: ReactNode;
    colors?: Partial<TabBarColors>;
    config?: DeepPartial<TabBarConfig>;
    displayScale?: number;
    maxWidth?: DimensionValue;
    recording?: boolean;
    items: readonly TabsItem[];
    onTabChange?: (event: TabsChangeEvent) => void;
    onTabPress?: (event: TabsChangeEvent) => void;
    opacity?: Partial<TabBarOpacity>;
    selectedIndex?: number | null;
    selectedBackdrop?: ReactNode;
    touchFeedbackEnabled?: boolean;
    touchFeedbackColor?: string;
    touchFeedbackOpacity?: number;
    touchFeedbackScale?: number;
}

/** @deprecated Use JellyTabBarHeadlessProps instead. */
export type TabsProps = JellyTabBarHeadlessProps;

export interface JellyNavigationRoute {
    key: string;
    name: string;
    params?: object;
    path?: string;
}

export interface JellyNavigationState {
    index: number;
    key: string;
    routes: readonly JellyNavigationRoute[];
}

export interface JellyNavigationOptions {
    href?: unknown;
    tabBarActiveBackgroundColor?: unknown;
    tabBarActiveTintColor?: unknown;
    tabBarBackground?: () => ReactNode;
    tabBarIcon?: (props: {
        color: string;
        focused: boolean;
        size: number;
    }) => ReactNode;
    tabBarInactiveBackgroundColor?: unknown;
    tabBarInactiveTintColor?: unknown;
    tabBarLabel?: unknown;
    tabBarShowLabel?: boolean;
    tabBarStyle?: unknown;
    title?: string;
}

export interface JellyNavigationDescriptor {
    options: JellyNavigationOptions;
}

export interface JellyNavigationEvent {
    canPreventDefault?: boolean;
    target: string;
    type: "tabPress" | "tabLongPress";
}

export interface JellyNavigationHelpers {
    dispatch(action: {
        payload: {
            name: string;
            params?: object;
            path?: string;
        };
        target: string;
        type: "NAVIGATE";
    }): void;
    emit(event: JellyNavigationEvent): unknown;
}

export interface JellyTabBarProps
    extends Omit<
        JellyTabBarHeadlessProps,
        "items" | "onTabChange" | "onTabPress" | "selectedIndex"
    > {
    containerStyle?: StyleProp<ViewStyle>;
    descriptors: Readonly<Record<string, JellyNavigationDescriptor>>;
    floating?: boolean;
    insets: {
        bottom: number;
        left: number;
        right: number;
        top: number;
    };
    navigation: JellyNavigationHelpers;
    state: JellyNavigationState;
}
