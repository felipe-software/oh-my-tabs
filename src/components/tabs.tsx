import { TabItem } from "@/components/tab-item";
import { usePillJelly } from "@/hooks/use-pill-jelly";
import MaskedView from "@react-native-masked-view/masked-view";
import {
    CameraIcon,
    GearSixIcon,
    HouseIcon,
    PaintBrushBroadIcon,
} from "phosphor-react-native";
import { cloneElement } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

const MASK_OVERSCAN_X = 48;
const MASK_OVERSCAN_Y = 16;

export const Tabs = () => {
    const {
        activeItemStyle,
        gesture,
        panelStyle,
        pillMaskStyle,
        setTrackWidth,
        surfaceStyle,
    } = usePillJelly();

    const tabs = [
        <TabItem
            icon={<HouseIcon size={16} style={styles.iconScale} />}
            text="Home"
        />,
        <TabItem
            icon={<CameraIcon size={16} style={styles.iconScale} />}
            text="Camera"
        />,
        <TabItem
            icon={<GearSixIcon size={16} style={styles.iconScale} />}
            text="Settings"
        />,
        <TabItem
            icon={
                <PaintBrushBroadIcon size={16} style={styles.iconScale} />
            }
            text="Walls"
        />,
    ];

    return (
        <GestureDetector gesture={gesture}>
            <View
                collapsable={false}
                pointerEvents="box-only"
                testID="tabs-drag-surface"
                style={styles.track}
                onLayout={(event) =>
                    setTrackWidth(event.nativeEvent.layout.width)
                }
            >
                <Animated.View style={[styles.surface, surfaceStyle]} />

                <Animated.View style={[styles.tabsRow, panelStyle]}>
                    {tabs.map((tab, index) =>
                        cloneElement(tab, { key: `inactive-${index}` }),
                    )}
                </Animated.View>

                <Animated.View
                    pointerEvents="none"
                    style={[styles.maskOverscan, panelStyle]}
                >
                    <MaskedView
                        style={StyleSheet.absoluteFill}
                        maskElement={
                            <Animated.View
                                style={[styles.pillMask, pillMaskStyle]}
                            />
                        }
                    >
                        <View style={styles.selectedSurface} />
                        <View style={styles.selectedTabsRow}>
                            {tabs.map((tab, index) =>
                                cloneElement(tab, {
                                    animatedStyle: activeItemStyle,
                                    isActive: true,
                                    key: `active-${index}`,
                                }),
                            )}
                        </View>
                    </MaskedView>
                </Animated.View>
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    track: {
        position: "relative",
        width: "100%",
        height: 64,
        overflow: "visible",
    },
    surface: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#1f1f1f",
        borderRadius: 32,
    },
    tabsRow: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        paddingHorizontal: 4,
        flexDirection: "row",
        alignItems: "center",
    },
    iconScale: {
        transform: [{ scale: 1.5 }],
    },
    maskOverscan: {
        position: "absolute",
        left: -MASK_OVERSCAN_X,
        right: -MASK_OVERSCAN_X,
        top: -MASK_OVERSCAN_Y,
        bottom: -MASK_OVERSCAN_Y,
    },
    pillMask: {
        position: "absolute",
        left: MASK_OVERSCAN_X + 4,
        top: MASK_OVERSCAN_Y + 4,
        height: 56,
        backgroundColor: "#000000",
        borderRadius: 999,
    },
    selectedSurface: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#c0c0c0",
    },
    selectedTabsRow: {
        position: "absolute",
        left: MASK_OVERSCAN_X + 4,
        right: MASK_OVERSCAN_X + 4,
        top: MASK_OVERSCAN_Y + 4,
        height: 56,
        flexDirection: "row",
        alignItems: "center",
    },
});
