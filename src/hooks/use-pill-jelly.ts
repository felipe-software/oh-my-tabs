import type { TabBarConfig } from "../constants";
import { useDistortion } from "./use-distortion";
import {
    getMaxTabIndex,
    getHorizontalPanelOffset,
    getTabWidth,
} from "../utils/animation";
import {
    advancePillJellyFrame,
    type PillJellyFrameState,
} from "../utils/pill-jelly-animation";
import { Gesture } from "react-native-gesture-handler";
import { Platform, type ViewStyle } from "react-native";
import { useCallback, useEffect, useMemo } from "react";
import {
    clamp,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
} from "react-native-reanimated";

const IS_WEB = Platform.OS === "web";

const getControlledSelectedIndex = (
    selectedIndex: number | null,
    tabCount: number,
) => {
    if (selectedIndex === null || selectedIndex < 0 || tabCount === 0) {
        return -1;
    }

    return Math.min(selectedIndex, getMaxTabIndex(tabCount));
};

export const usePillJelly = (
    tabCount: number,
    config: TabBarConfig,
    recording = false,
    displayScale = 1,
    touchFeedbackRadius = 0,
    controlledSelectedIndex?: number | null,
    onTabChange?: (index: number) => void,
    onTabPress?: (index: number) => boolean | void,
    onTabLongPress?: (index: number) => void,
) => {
    const geometryScale = displayScale > 0 ? displayScale : 1;
    const { layout, pillJelly } = config;
    const itemHeight = layout.itemHeight * geometryScale;
    const maskOverscanX = layout.maskOverscanX * geometryScale;
    const maskOverscanY = layout.maskOverscanY * geometryScale;
    const trackInset = layout.trackInset * geometryScale;
    const trackHeight = layout.trackHeight * geometryScale;
    const {
        begin: beginTabbarInteraction,
        end: endTabbarInteraction,
        pressedStyle,
        selectedTouchFeedbackStyle,
        setTrackWidth: setDistortionTrackWidth,
        tabbarStyle,
        touchFeedbackStyle,
        update: updateDistortion,
    } = useDistortion(config, geometryScale, touchFeedbackRadius);
    const trackWidth = useSharedValue(0);
    const initialSelectedIndex =
        controlledSelectedIndex === undefined
            ? tabCount > 0
                ? 0
                : -1
            : getControlledSelectedIndex(controlledSelectedIndex, tabCount);
    const initialPillPosition = Math.max(initialSelectedIndex, 0);
    const value = useSharedValue(initialPillPosition);
    const valueVelocity = useSharedValue(0);
    const targetValue = useSharedValue(initialPillPosition);
    const selectedIndex = useSharedValue(initialSelectedIndex);

    const filteredVelocity = useSharedValue(0);
    const filteredVelocityRate = useSharedValue(0);

    const pressProgress = useSharedValue(0);
    const pressProgressRate = useSharedValue(0);
    const pressTarget = useSharedValue(0);

    const baseScaleX = useSharedValue(1);
    const baseScaleXRate = useSharedValue(0);
    const baseScaleY = useSharedValue(1);
    const baseScaleYRate = useSharedValue(0);
    const shapeTarget = useSharedValue(1);

    const rawPanelOffset = useSharedValue(0);
    const rawPanelOffsetVelocity = useSharedValue(0);

    const isDragging = useSharedValue(0);
    const releasePending = useSharedValue(0);
    const downX = useSharedValue(0);
    const webTrackPageX = useSharedValue(Number.NaN);
    const movedDistance = useSharedValue(0);
    const dragStartTarget = useSharedValue(0);
    const dragStartPanelOffset = useSharedValue(0);

    // Shared values are stable for the lifetime of the hook. Keeping their
    // container stable also prevents Reanimated from serializing it again on
    // unrelated React renders such as a palette update.
    const frameState = useMemo<PillJellyFrameState>(
        () => ({
            baseScaleX,
            baseScaleXRate,
            baseScaleY,
            baseScaleYRate,
            filteredVelocity,
            filteredVelocityRate,
            isDragging,
            pressProgress,
            pressProgressRate,
            pressTarget,
            rawPanelOffset,
            rawPanelOffsetVelocity,
            releasePending,
            shapeTarget,
            targetValue,
            value,
            valueVelocity,
        }),
        [],
    );

    useEffect(() => {
        if (controlledSelectedIndex === undefined) {
            return;
        }

        const nextIndex = getControlledSelectedIndex(
            controlledSelectedIndex,
            tabCount,
        );
        selectedIndex.value = nextIndex;
        if (nextIndex >= 0) {
            targetValue.value = nextIndex;
        }
        releasePending.value = 1;
        pressTarget.value = 0;
        shapeTarget.value = 1;
    }, [
        controlledSelectedIndex,
        pressTarget,
        releasePending,
        selectedIndex,
        shapeTarget,
        tabCount,
        targetValue,
    ]);

    const frameCallback = useCallback(
        ({
            timeSincePreviousFrame,
        }: {
            timeSincePreviousFrame: number | null;
        }) => {
            "worklet";

            advancePillJellyFrame(
                frameState,
                pillJelly.frameConfig,
                tabCount,
                timeSincePreviousFrame,
            );
        },
        [frameState, pillJelly.frameConfig, tabCount],
    );
    const frameLoop = useFrameCallback(frameCallback, false);

    const panelOffset = useDerivedValue(() => {
        return getHorizontalPanelOffset(
            rawPanelOffset.value,
            trackWidth.value,
            geometryScale,
        );
    });

    const panelStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: panelOffset.value }],
    }));

    const getPillMaskStyle = () => {
        "worklet";

        const tabWidth = getTabWidth(trackWidth.value, trackInset, tabCount);
        const velocity = filteredVelocity.value / 10;
        const scaleXCorrection = clamp(velocity * 0.75, -0.2, 0.2);
        const scaleYCorrection = clamp(velocity * 0.25, -0.2, 0.2);

        return {
            width: tabWidth,
            transform: [
                { translateX: value.value * tabWidth },
                { scaleX: baseScaleX.value / (1 - scaleXCorrection) },
                { scaleY: baseScaleY.value * (1 - scaleYCorrection) },
            ],
        };
    };

    const pillMaskStyle = useAnimatedStyle(getPillMaskStyle);

    const getPillClipStyle = () => {
        "worklet";

        const tabWidth = getTabWidth(trackWidth.value, trackInset, tabCount);
        const velocity = filteredVelocity.value / 10;
        const scaleXCorrection = clamp(velocity * 0.75, -0.2, 0.2);
        const scaleYCorrection = clamp(velocity * 0.25, -0.2, 0.2);
        const scaleX = baseScaleX.value / (1 - scaleXCorrection);
        const scaleY = baseScaleY.value * (1 - scaleYCorrection);
        const pillWidth = tabWidth * scaleX;
        const pillHeight = itemHeight * scaleY;
        const left =
            maskOverscanX +
            trackInset +
            value.value * tabWidth -
            (pillWidth - tabWidth) / 2;
        const top = maskOverscanY + trackInset - (pillHeight - itemHeight) / 2;
        const right = trackWidth.value + maskOverscanX * 2 - left - pillWidth;
        const bottom = trackHeight + maskOverscanY * 2 - top - pillHeight;

        // MaskedView has no web implementation. A CSS inset clip preserves
        // the same animated pill geometry while keeping its contents fixed.
        return {
            clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`,
        } as unknown as ViewStyle;
    };

    const pillClipStyle = useAnimatedStyle(getPillClipStyle);

    const activeItemStyle = useAnimatedStyle(() => {
        const scale = 1 + 0.2 * pressProgress.value;
        return { transform: [{ scaleX: scale }, { scaleY: scale }] };
    });

    const confirmTabPressOnJS = useCallback(
        (index: number) => {
            const accepted = onTabPress?.(index);
            if (accepted === false) {
                // The controlled prop will not change after a rejected press,
                // so its effect will not run again. Restore the pill directly.
                const fallbackIndex =
                    controlledSelectedIndex === undefined
                        ? selectedIndex.value
                        : getControlledSelectedIndex(
                              controlledSelectedIndex,
                              tabCount,
                          );
                selectedIndex.value = fallbackIndex;
                if (fallbackIndex >= 0) {
                    targetValue.value = fallbackIndex;
                }
                releasePending.value = 1;
                pressTarget.value = 0;
                shapeTarget.value = 1;
                return;
            }

            if (index !== selectedIndex.value) {
                selectedIndex.value = index;
                onTabChange?.(index);
            }
        },
        [
            controlledSelectedIndex,
            onTabChange,
            onTabPress,
            pressTarget,
            releasePending,
            selectedIndex,
            shapeTarget,
            tabCount,
            targetValue,
        ],
    );

    const activateTab = useCallback(
        (index: number) => {
            if (tabCount === 0) {
                return;
            }

            const nextIndex = Math.min(
                Math.max(index, 0),
                getMaxTabIndex(tabCount),
            );
            targetValue.value = nextIndex;
            releasePending.value = 1;
            confirmTabPressOnJS(nextIndex);
        },
        [confirmTabPressOnJS, releasePending, tabCount, targetValue],
    );

    const finishGesture = () => {
        "worklet";

        isDragging.value = 0;
        rawPanelOffsetVelocity.value = 0;
        endTabbarInteraction();

        const tabWidth = getTabWidth(trackWidth.value, trackInset, tabCount);
        let nextIndex: number;

        if (movedDistance.value < 4 && tabWidth > 0) {
            // A stationary gesture is a regular tab click. A moving gesture
            // remains relative, so every point of the bar acts as a handle.
            nextIndex = Math.floor((downX.value - trackInset) / tabWidth);
        } else {
            nextIndex = Math.round(targetValue.value);
        }

        nextIndex = clamp(nextIndex, 0, getMaxTabIndex(tabCount));
        targetValue.value = nextIndex;
        releasePending.value = 1;

        if (tabCount > 0) {
            runOnJS(confirmTabPressOnJS)(nextIndex);
        }
    };

    const beginGesture = (
        localX: number,
        localY: number,
        absoluteX: number,
    ) => {
        "worklet";

        beginTabbarInteraction(localX, localY, absoluteX);
        downX.value = localX;
        movedDistance.value = 0;

        const tabWidth = getTabWidth(trackWidth.value, trackInset, tabCount);
        if (pillJelly.snapOnPointerDown && tabWidth > 0) {
            targetValue.value = clamp(
                Math.floor((localX - trackInset) / tabWidth),
                0,
                getMaxTabIndex(tabCount),
            );
        }

        dragStartTarget.value = targetValue.value;
        dragStartPanelOffset.value = rawPanelOffset.value;
        isDragging.value = 1;
        releasePending.value = 0;
        pressTarget.value = 1;
        shapeTarget.value = pillJelly.pressedScale;
        rawPanelOffsetVelocity.value = 0;
    };

    const panGesture = Gesture.Pan()
        .minDistance(0)
        .maxPointers(1)
        .shouldCancelWhenOutside(false)
        .onBegin(() => runOnJS(frameLoop.setActive)(true))
        .onTouchesDown((event) => {
            const firstTouch = event.changedTouches[0] ?? event.allTouches[0];
            if (!firstTouch) {
                return;
            }

            // RNGH Web can report x relative to its display: contents
            // wrapper. Derive it from the measured track instead.
            const localX = recording
                ? firstTouch.y
                : IS_WEB && Number.isFinite(webTrackPageX.value)
                  ? firstTouch.absoluteX - webTrackPageX.value
                  : firstTouch.x;
            const localY = recording ? trackHeight / 2 : firstTouch.y;
            const absoluteX = recording
                ? firstTouch.absoluteY
                : firstTouch.absoluteX;

            beginGesture(localX, localY, absoluteX);
        })
        .onUpdate((event) => {
            const tabWidth = getTabWidth(
                trackWidth.value,
                trackInset,
                tabCount,
            );
            if (tabWidth <= 0) {
                return;
            }

            const horizontalTranslation = recording
                ? event.translationY
                : event.translationX;
            const verticalTranslation = recording
                ? -event.translationX
                : event.translationY;

            targetValue.value = clamp(
                dragStartTarget.value + horizontalTranslation / tabWidth,
                0,
                getMaxTabIndex(tabCount),
            );
            const absoluteX = recording ? event.absoluteY : event.absoluteX;

            rawPanelOffset.value =
                dragStartPanelOffset.value + horizontalTranslation;
            updateDistortion(
                verticalTranslation,
                absoluteX,
                IS_WEB ? downX.value + horizontalTranslation : null,
            );
            movedDistance.value = Math.max(
                movedDistance.value,
                Math.abs(horizontalTranslation),
                Math.abs(verticalTranslation),
            );
        })
        .onFinalize(() => {
            finishGesture();
            runOnJS(frameLoop.setActive)(false);
        });

    const longPressGesture = Gesture.LongPress()
        .enabled(tabCount > 0 && Boolean(onTabLongPress))
        .minDuration(500)
        .maxDistance(10)
        .onStart((event) => {
            if (!onTabLongPress) {
                return;
            }

            const tabWidth = getTabWidth(
                trackWidth.value,
                trackInset,
                tabCount,
            );
            if (tabWidth <= 0) {
                return;
            }

            const localX = recording ? event.y : event.x;
            const index = clamp(
                Math.floor((localX - trackInset) / tabWidth),
                0,
                getMaxTabIndex(tabCount),
            );
            runOnJS(onTabLongPress)(index);
        });

    const gesture = onTabLongPress
        ? Gesture.Simultaneous(panGesture, longPressGesture)
        : panGesture;

    const setTrackWidth = (width: number) => {
        trackWidth.value = width;
        setDistortionTrackWidth(width);
    };

    const setWebTrackPageX = (pageX: number) => {
        if (IS_WEB && Number.isFinite(pageX)) {
            webTrackPageX.value = pageX;
        }
    };

    return {
        activateTab,
        activeItemStyle,
        gesture,
        panelStyle,
        pillClipStyle,
        pillMaskStyle,
        pressedStyle,
        selectedTouchFeedbackStyle,
        setTrackWidth,
        setWebTrackPageX,
        tabbarStyle,
        touchFeedbackStyle,
    };
};
