import type {
    DeepPartial,
    TabBarColors,
    TabBarConfig,
    TabBarOpacity,
} from "./constants";
import type { ComponentType, ReactNode } from "react";

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

export interface TabsProps {
    backdrop?: ReactNode;
    colors?: Partial<TabBarColors>;
    config?: DeepPartial<TabBarConfig>;
    displayScale?: number;
    recording?: boolean;
    items: readonly TabsItem[];
    onTabChange?: (event: TabsChangeEvent) => void;
    opacity?: Partial<TabBarOpacity>;
    selectedBackdrop?: ReactNode;
    touchFeedbackEnabled?: boolean;
    touchFeedbackColor?: string;
    touchFeedbackOpacity?: number;
    touchFeedbackScale?: number;
}
