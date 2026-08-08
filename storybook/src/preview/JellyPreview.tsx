import { type ReactNode, useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
    JellyTabBarHeadless,
    type DeepPartial,
    type TabBarColors,
    type TabBarConfig,
    type TabBarOpacity,
    type TabsChangeEvent,
    type TabsItem,
} from "react-native-jelly-tabs";
import { CameraIcon, HomeIcon, PaintIcon, SettingsIcon } from "./icons";

// The "Amber" preset the example ships as its default look.
export const DEFAULT_PREVIEW_COLORS: TabBarColors = {
    activeContent: "#451A03",
    inactiveContent: "#A8A29E",
    selectedSurface: "#F59E0B",
    surface: "#1C1917",
};

export const DEFAULT_PREVIEW_ITEMS: TabsItem[] = [
    { key: "home", label: "Home", activeIcon: HomeIcon, inactiveIcon: HomeIcon },
    {
        key: "camera",
        label: "Camera",
        activeIcon: CameraIcon,
        inactiveIcon: CameraIcon,
    },
    {
        key: "settings",
        label: "Settings",
        activeIcon: SettingsIcon,
        inactiveIcon: SettingsIcon,
    },
    {
        key: "walls",
        label: "Walls",
        activeIcon: PaintIcon,
        inactiveIcon: PaintIcon,
    },
];

// expo-blur's BlurView, reduced to what the web needs: a translucent layer with
// a CSS backdrop-filter so the gradient behind the bar bleeds through.
const PreviewBlur = ({
    intensity,
    tint = "dark",
}: {
    intensity: number;
    tint?: "dark" | "light";
}) => {
    const radius = Math.round(intensity * 0.4);
    if (Platform.OS === "web") {
        const backgroundColor =
            tint === "dark" ? "rgba(20,18,16,0.35)" : "rgba(250,250,249,0.12)";
        return (
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor,
                    backdropFilter: `blur(${radius}px)`,
                    WebkitBackdropFilter: `blur(${radius}px)`,
                }}
            />
        );
    }
    return (
        <View
            style={[
                StyleSheet.absoluteFill,
                {
                    backgroundColor:
                        tint === "dark"
                            ? "rgba(20,18,16,0.5)"
                            : "rgba(250,250,249,0.16)",
                },
            ]}
        />
    );
};

// A random photo behind glass — same recipe as the example app — so the blur
// backdrops have something rich to sample. A soft scrim keeps the pill legible.
const randomBackground = () =>
    `https://picsum.photos/2292/1034?random=${Math.floor(Math.random() * 1_000_000)}`;

const Stage = ({ children }: { children: ReactNode }) => {
    const [bg] = useState(randomBackground);
    if (Platform.OS === "web") {
        return (
            <div
                style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 300,
                    padding: 28,
                    borderRadius: 24,
                    overflow: "hidden",
                    backgroundColor: "#11100f",
                    backgroundImage: `linear-gradient(rgba(10,9,8,0.25), rgba(10,9,8,0.45)), url(${bg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            >
                {children}
            </div>
        );
    }
    return <View style={styles.nativeStage}>{children}</View>;
};

export interface JellyPreviewProps {
    colors?: Partial<TabBarColors>;
    config?: DeepPartial<TabBarConfig>;
    opacity?: Partial<TabBarOpacity>;
    items?: TabsItem[];
    showBlur?: boolean;
    blurTrack?: number;
    blurPill?: number;
    maxWidth?: number;
    touchFeedbackColor?: string;
    touchFeedbackEnabled?: boolean;
    selectedIndex?: number | null;
    onTabChange?: (event: TabsChangeEvent) => void;
}

export const JellyPreview = ({
    colors,
    config,
    opacity,
    items = DEFAULT_PREVIEW_ITEMS,
    showBlur = true,
    blurTrack = 35,
    blurPill = 20,
    maxWidth = 400,
    touchFeedbackColor,
    touchFeedbackEnabled = true,
    selectedIndex,
    onTabChange,
}: JellyPreviewProps) => {
    const resolvedColors = { ...DEFAULT_PREVIEW_COLORS, ...colors };

    return (
        <GestureHandlerRootView style={styles.root}>
            <Stage>
                <View style={[styles.barSlot, { maxWidth }]}>
                    <JellyTabBarHeadless
                        backdrop={
                            showBlur ? (
                                <PreviewBlur intensity={blurTrack} tint="dark" />
                            ) : undefined
                        }
                        colors={resolvedColors}
                        config={config}
                        items={items}
                        opacity={opacity}
                        selectedIndex={selectedIndex ?? undefined}
                        selectedBackdrop={
                            showBlur ? (
                                <PreviewBlur
                                    intensity={blurPill}
                                    tint="light"
                                />
                            ) : undefined
                        }
                        touchFeedbackColor={
                            touchFeedbackColor ?? resolvedColors.selectedSurface
                        }
                        touchFeedbackEnabled={touchFeedbackEnabled}
                        onTabChange={onTabChange}
                    />
                </View>
            </Stage>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    root: {
        flex: 1,
        width: "100%",
    },
    nativeStage: {
        alignItems: "center",
        backgroundColor: "#11100f",
        borderRadius: 24,
        justifyContent: "center",
        minHeight: 300,
        padding: 28,
    },
    barSlot: {
        alignSelf: "center",
        width: "100%",
    },
});
