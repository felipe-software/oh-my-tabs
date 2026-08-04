import { TabItem } from "@/components/tab-item";
import {
    DEFAULT_TAB_BAR_COLORS,
    DISTORTION,
    TABBAR_LAYOUT,
    type TabBarColors,
} from "@/constants";
import { usePillJelly } from "@/hooks/use-pill-jelly";
import MaskedView from "@react-native-masked-view/masked-view";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import { cloneElement } from "react";
import {
    StyleProp,
    StyleSheet,
    View,
    ViewStyle,
} from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
    AnimatedStyle,
} from "react-native-reanimated";
import Svg, {
    Defs,
    RadialGradient,
    Rect,
    Stop,
} from "react-native-svg";

interface TabsProps {
    colors?: Partial<TabBarColors>;
    displayScale?: number;
    recording?: boolean;
    touchFeedbackEnabled?: boolean;
    touchFeedbackOpacity?: number;
    touchFeedbackScale?: number;
}

interface TouchFeedbackProps {
    animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
    centerOpacity: number;
    diameter: number;
    gradientId: string;
    middleOpacity: number;
    offsetX?: number;
    offsetY?: number;
    radius: number;
}

interface PillMaskProps {
    animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
    height: number;
    left: number;
    top: number;
}

const PillMask = ({
    animatedStyle,
    height,
    left,
    top,
}: PillMaskProps) => (
    <Animated.View
        style={[
            styles.pillMask,
            { height, left, top },
            animatedStyle,
        ]}
    />
);

const TouchFeedback = ({
    animatedStyle,
    centerOpacity,
    diameter,
    gradientId,
    middleOpacity,
    offsetX = 0,
    offsetY = 0,
    radius,
}: TouchFeedbackProps) => (
    <Animated.View
        style={[
            styles.touchFeedback,
            {
                height: diameter,
                left: offsetX,
                top: offsetY,
                width: diameter,
            },
            animatedStyle,
        ]}
    >
        <Svg height={diameter} width={diameter}>
            <Defs>
                <RadialGradient
                    id={gradientId}
                    cx={radius}
                    cy={radius}
                    fx={radius}
                    fy={radius}
                    gradientUnits="userSpaceOnUse"
                    r={radius}
                >
                    <Stop
                        offset="0%"
                        stopColor="#ffffff"
                        stopOpacity={centerOpacity}
                    />
                    <Stop
                        offset="45%"
                        stopColor="#ffffff"
                        stopOpacity={middleOpacity}
                    />
                    <Stop
                        offset="100%"
                        stopColor="#ffffff"
                        stopOpacity={0}
                    />
                </RadialGradient>
            </Defs>
            <Rect
                fill={`url(#${gradientId})`}
                height={diameter}
                width={diameter}
            />
        </Svg>
    </Animated.View>
);

export const Tabs = ({
    colors,
    displayScale = 1,
    recording = false,
    touchFeedbackEnabled = true,
    touchFeedbackOpacity = DISTORTION.touchFeedback.opacity,
    touchFeedbackScale = DISTORTION.touchFeedback.scale,
}: TabsProps) => {
    const resolvedColors = {
        ...DEFAULT_TAB_BAR_COLORS,
        ...colors,
    };
    const maskOverscanX =
        TABBAR_LAYOUT.maskOverscanX * displayScale;
    const maskOverscanY =
        TABBAR_LAYOUT.maskOverscanY * displayScale;
    const trackInset = TABBAR_LAYOUT.trackInset * displayScale;
    const trackHeight = TABBAR_LAYOUT.trackHeight * displayScale;
    const itemHeight = TABBAR_LAYOUT.itemHeight * displayScale;
    const iconSize = TABBAR_LAYOUT.iconSize * displayScale;
    const normalizedTouchFeedbackOpacity = Math.min(
        Math.max(touchFeedbackOpacity, 0),
        1,
    );
    const normalizedTouchFeedbackScale = Math.max(
        touchFeedbackScale,
        0,
    );
    const touchFeedbackRadius =
        DISTORTION.touchFeedback.radius *
        normalizedTouchFeedbackScale *
        displayScale;
    const touchFeedbackDiameter = touchFeedbackRadius * 2;
    const touchFeedbackMiddleOpacity =
        normalizedTouchFeedbackOpacity *
        DISTORTION.touchFeedback.middleOpacityRatio;

    const tabs = [
        <TabItem
            activeColor={resolvedColors.activeContent}
            displayScale={displayScale}
            icon={<MaterialIcons name="home" size={iconSize} />}
            inactiveColor={resolvedColors.inactiveContent}
            key="home"
            text="Home"
        />,
        <TabItem
            activeColor={resolvedColors.activeContent}
            displayScale={displayScale}
            icon={<MaterialIcons name="photo-camera" size={iconSize} />}
            inactiveColor={resolvedColors.inactiveContent}
            key="camera"
            text="Camera"
        />,
        <TabItem
            activeColor={resolvedColors.activeContent}
            displayScale={displayScale}
            icon={<MaterialIcons name="settings" size={iconSize} />}
            inactiveColor={resolvedColors.inactiveContent}
            key="settings"
            text="Settings"
        />,
        <TabItem
            activeColor={resolvedColors.activeContent}
            displayScale={displayScale}
            icon={<MaterialIcons name="format-paint" size={iconSize} />}
            inactiveColor={resolvedColors.inactiveContent}
            key="walls"
            text="Walls"
        />,
    ];
    const tabCount = tabs.length;
    const {
        activeItemStyle,
        activePillMaskStyle,
        gesture,
        panelStyle,
        pillMaskStyle,
        pressedStyle,
        selectedTouchFeedbackStyle,
        setTrackWidth,
        tabbarStyle,
        touchFeedbackStyle,
    } = usePillJelly(
        tabCount,
        recording,
        displayScale,
        touchFeedbackRadius,
    );

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
                        pointerEvents="none"
                        style={[styles.panel, panelStyle]}
                    >
                        <Animated.View
                            style={[
                                styles.surface,
                                {
                                    backgroundColor:
                                        resolvedColors.surface,
                                    borderRadius: trackHeight / 2,
                                },
                            ]}
                        />

                        {touchFeedbackEnabled && (
                            <View
                                style={[
                                    styles.touchFeedbackClip,
                                    { borderRadius: trackHeight / 2 },
                                ]}
                            >
                                <TouchFeedback
                                    animatedStyle={touchFeedbackStyle}
                                    centerOpacity={
                                        normalizedTouchFeedbackOpacity
                                    }
                                    diameter={touchFeedbackDiameter}
                                    gradientId="tabbar-touch-feedback"
                                    middleOpacity={
                                        touchFeedbackMiddleOpacity
                                    }
                                    radius={touchFeedbackRadius}
                                />
                            </View>
                        )}

                        <View
                            style={[
                                styles.tabsRow,
                                { paddingHorizontal: trackInset },
                            ]}
                        >
                            {tabs.map((tab, index) =>
                                cloneElement(tab, {
                                    key: `inactive-${index}`,
                                }),
                            )}
                        </View>

                        <View
                            style={[
                                styles.maskOverscan,
                                {
                                    bottom: -maskOverscanY,
                                    left: -maskOverscanX,
                                    right: -maskOverscanX,
                                    top: -maskOverscanY,
                                },
                            ]}
                        >
                            <MaskedView
                                style={StyleSheet.absoluteFill}
                                maskElement={
                                    <PillMask
                                        animatedStyle={pillMaskStyle}
                                        height={itemHeight}
                                        left={
                                            maskOverscanX + trackInset
                                        }
                                        top={
                                            maskOverscanY + trackInset
                                        }
                                    />
                                }
                            >
                                <View
                                    style={[
                                        styles.selectedSurface,
                                        {
                                            backgroundColor:
                                                resolvedColors.selectedSurface,
                                        },
                                    ]}
                                />
                                {touchFeedbackEnabled && (
                                    <TouchFeedback
                                        animatedStyle={
                                            selectedTouchFeedbackStyle
                                        }
                                        centerOpacity={
                                            normalizedTouchFeedbackOpacity
                                        }
                                        diameter={
                                            touchFeedbackDiameter
                                        }
                                        gradientId="selected-tab-touch-feedback"
                                        middleOpacity={
                                            touchFeedbackMiddleOpacity
                                        }
                                        offsetX={maskOverscanX}
                                        offsetY={maskOverscanY}
                                        radius={touchFeedbackRadius}
                                    />
                                )}
                            </MaskedView>

                            <MaskedView
                                style={StyleSheet.absoluteFill}
                                maskElement={
                                    <PillMask
                                        animatedStyle={
                                            activePillMaskStyle
                                        }
                                        height={itemHeight}
                                        left={
                                            maskOverscanX + trackInset
                                        }
                                        top={
                                            maskOverscanY + trackInset
                                        }
                                    />
                                }
                            >
                                <View
                                    style={[
                                        styles.selectedTabsRow,
                                        {
                                            height: itemHeight,
                                            left:
                                                maskOverscanX +
                                                trackInset,
                                            right:
                                                maskOverscanX +
                                                trackInset,
                                            top:
                                                maskOverscanY +
                                                trackInset,
                                        },
                                    ]}
                                >
                                    {tabs.map((tab, index) =>
                                        cloneElement(tab, {
                                            animatedStyle:
                                                activeItemStyle,
                                            isActive: true,
                                            key: `active-${index}`,
                                        }),
                                    )}
                                </View>
                            </MaskedView>
                        </View>
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
    panel: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
    },
    surface: {
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    touchFeedbackClip: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
        overflow: "hidden",
    },
    touchFeedback: {
        position: "absolute",
        left: 0,
        top: 0,
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
        zIndex: 2,
    },
    pillMask: {
        position: "absolute",
        backgroundColor: "#000000",
        borderRadius: 999,
    },
    selectedSurface: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
    },
    selectedTabsRow: {
        position: "absolute",
        flexDirection: "row",
        alignItems: "center",
        zIndex: 1,
    },
});
