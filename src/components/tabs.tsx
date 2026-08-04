import { TabItem } from "@/components/tab-item";
import { TABBAR_LAYOUT } from "@/constants";
import { usePillJelly } from "@/hooks/use-pill-jelly";
import MaskedView from "@react-native-masked-view/masked-view";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import { cloneElement } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

interface TabsProps {
    displayScale?: number;
    recording?: boolean;
}

export const Tabs = ({
    displayScale = 1,
    recording = false,
}: TabsProps) => {
    const maskOverscanX =
        TABBAR_LAYOUT.maskOverscanX * displayScale;
    const maskOverscanY =
        TABBAR_LAYOUT.maskOverscanY * displayScale;
    const trackInset = TABBAR_LAYOUT.trackInset * displayScale;
    const trackHeight = TABBAR_LAYOUT.trackHeight * displayScale;
    const itemHeight = TABBAR_LAYOUT.itemHeight * displayScale;
    const iconSize = TABBAR_LAYOUT.iconSize * displayScale;

    const tabs = [
        <TabItem
            displayScale={displayScale}
            icon={<MaterialIcons name="home" size={iconSize} />}
            text="Home"
        />,
        <TabItem
            displayScale={displayScale}
            icon={<MaterialIcons name="photo-camera" size={iconSize} />}
            text="Camera"
        />,
        <TabItem
            displayScale={displayScale}
            icon={<MaterialIcons name="settings" size={iconSize} />}
            text="Settings"
        />,
        <TabItem
            displayScale={displayScale}
            icon={<MaterialIcons name="format-paint" size={iconSize} />}
            text="Walls"
        />,
        <TabItem
            displayScale={displayScale}
            icon={<MaterialIcons name="format-paint" size={iconSize} />}
            text="Walls"
        />,
    ];
    const tabCount = tabs.length;
    const {
        activeItemStyle,
        gesture,
        panelStyle,
        pillMaskStyle,
        pressedStyle,
        setTrackWidth,
        surfaceStyle,
        tabbarStyle,
    } = usePillJelly(tabCount, recording, displayScale);

    return (
        <GestureDetector gesture={gesture}>
            <Animated.View
                collapsable={false}
                style={[
                    styles.pressWrapper,
                    { height: trackHeight },
                    pressedStyle,
                ]}
            >
                <Animated.View
                    collapsable={false}
                    pointerEvents="box-only"
                    testID="tabs-drag-surface"
                    style={[
                        styles.track,
                        { height: trackHeight },
                        tabbarStyle,
                    ]}
                    onLayout={(event) =>
                        setTrackWidth(event.nativeEvent.layout.width)
                    }
                >
                    <Animated.View
                        style={[
                            styles.surface,
                            { borderRadius: trackHeight / 2 },
                            surfaceStyle,
                        ]}
                    />

                    <Animated.View
                        style={[
                            styles.tabsRow,
                            { paddingHorizontal: trackInset },
                            panelStyle,
                        ]}
                    >
                        {tabs.map((tab, index) =>
                            cloneElement(tab, {
                                key: `inactive-${index}`,
                            }),
                        )}
                    </Animated.View>

                    <Animated.View
                        pointerEvents="none"
                        style={[
                            styles.maskOverscan,
                            {
                                bottom: -maskOverscanY,
                                left: -maskOverscanX,
                                right: -maskOverscanX,
                                top: -maskOverscanY,
                            },
                            panelStyle,
                        ]}
                    >
                        <MaskedView
                            style={StyleSheet.absoluteFill}
                            maskElement={
                                <Animated.View
                                    style={[
                                        styles.pillMask,
                                        {
                                            height: itemHeight,
                                            left:
                                                maskOverscanX +
                                                trackInset,
                                            top:
                                                maskOverscanY +
                                                trackInset,
                                        },
                                        pillMaskStyle,
                                    ]}
                                />
                            }
                        >
                            <View style={styles.selectedSurface} />
                            <View
                                style={[
                                    styles.selectedTabsRow,
                                    {
                                        height: itemHeight,
                                        left:
                                            maskOverscanX + trackInset,
                                        right:
                                            maskOverscanX + trackInset,
                                        top:
                                            maskOverscanY + trackInset,
                                    },
                                ]}
                            >
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
                </Animated.View>
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    pressWrapper: {
        width: "100%",
    },
    track: {
        position: "relative",
        width: "100%",
        overflow: "visible",
    },
    surface: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#1f1f1f",
    },
    tabsRow: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
    },
    maskOverscan: {
        position: "absolute",
    },
    pillMask: {
        position: "absolute",
        backgroundColor: "#000000",
        borderRadius: 999,
    },
    selectedSurface: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: "#cecece",
    },
    selectedTabsRow: {
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
    },
});
