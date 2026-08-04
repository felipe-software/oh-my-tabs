import { PILL_JELLY, TABBAR_LAYOUT } from "../constants";
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
import { usePanGesture } from "react-native-gesture-handler";
import type { ViewStyle } from "react-native";
import {
    clamp,
    useAnimatedStyle,
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
} from "react-native-reanimated";

export const usePillJelly = (
    tabCount: number,
    recording = false,
    displayScale = 1,
    touchFeedbackRadius = 0,
) => {
    const geometryScale = displayScale > 0 ? displayScale : 1;
    const itemHeight = TABBAR_LAYOUT.itemHeight * geometryScale;
    const maskOverscanX = TABBAR_LAYOUT.maskOverscanX * geometryScale;
    const maskOverscanY = TABBAR_LAYOUT.maskOverscanY * geometryScale;
    const trackInset = TABBAR_LAYOUT.trackInset * geometryScale;
    const trackHeight = TABBAR_LAYOUT.trackHeight * geometryScale;
    const {
        begin: beginTabbarInteraction,
        end: endTabbarInteraction,
        pressedStyle,
        selectedTouchFeedbackStyle,
        setTrackWidth: setDistortionTrackWidth,
        tabbarStyle,
        touchFeedbackStyle,
        update: updateDistortion,
    } = useDistortion(geometryScale, touchFeedbackRadius);
    const trackWidth = useSharedValue(0);
    const value = useSharedValue(0);
    const valueVelocity = useSharedValue(0);
    const targetValue = useSharedValue(0);

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
    const movedDistance = useSharedValue(0);
    const dragStartTarget = useSharedValue(0);
    const dragStartPanelOffset = useSharedValue(0);

    const frameState: PillJellyFrameState = {
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
    };

    useFrameCallback(({ timeSincePreviousFrame }) => {
        "worklet";

        advancePillJellyFrame(
            frameState,
            PILL_JELLY.frameConfig,
            tabCount,
            timeSincePreviousFrame,
        );
    });

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

        const tabWidth = getTabWidth(
            trackWidth.value,
            trackInset,
            tabCount,
        );
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
    const activePillMaskStyle = useAnimatedStyle(
        getPillMaskStyle,
    );

    const getPillClipStyle = () => {
        "worklet";

        const tabWidth = getTabWidth(
            trackWidth.value,
            trackInset,
            tabCount,
        );
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
        const top =
            maskOverscanY +
            trackInset -
            (pillHeight - itemHeight) / 2;
        const right =
            trackWidth.value + maskOverscanX * 2 - left - pillWidth;
        const bottom =
            trackHeight + maskOverscanY * 2 - top - pillHeight;

        // MaskedView has no web implementation. A CSS inset clip preserves
        // the same animated pill geometry while keeping its contents fixed.
        return {
            clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`,
        } as unknown as ViewStyle;
    };

    const pillClipStyle = useAnimatedStyle(getPillClipStyle);
    const activePillClipStyle = useAnimatedStyle(getPillClipStyle);

    const activeItemStyle = useAnimatedStyle(() => {
        const scale = 1 + 0.2 * pressProgress.value;
        return { transform: [{ scaleX: scale }, { scaleY: scale }] };
    });

    const finishGesture = () => {
        "worklet";

        isDragging.value = 0;
        rawPanelOffsetVelocity.value = 0;
        endTabbarInteraction();

        const tabWidth = getTabWidth(
            trackWidth.value,
            trackInset,
            tabCount,
        );
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
    };

    const gesture = usePanGesture({
        minDistance: 0,
        maxPointers: 1,
        shouldCancelWhenOutside: false,
        onTouchesDown: (event) => {
            const firstTouch =
                event.changedTouches[0] ?? event.allTouches[0];
            if (!firstTouch) {
                return;
            }

            const localX = recording ? firstTouch.y : firstTouch.x;
            const localY = recording
                ? trackHeight / 2
                : firstTouch.y;
            const absoluteX = recording
                ? firstTouch.absoluteY
                : firstTouch.absoluteX;

            beginTabbarInteraction(localX, localY, absoluteX);
            downX.value = localX;
            movedDistance.value = 0;

            const tabWidth = getTabWidth(
                trackWidth.value,
                trackInset,
                tabCount,
            );
            if (PILL_JELLY.snapOnPointerDown && tabWidth > 0) {
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
            shapeTarget.value = PILL_JELLY.pressedScale;
            rawPanelOffsetVelocity.value = 0;
        },
        onUpdate: (event) => {
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
                dragStartTarget.value +
                    horizontalTranslation / tabWidth,
                0,
                getMaxTabIndex(tabCount),
            );
            const absoluteX = recording
                ? event.absoluteY
                : event.absoluteX;

            rawPanelOffset.value =
                dragStartPanelOffset.value + horizontalTranslation;
            updateDistortion(verticalTranslation, absoluteX);
            movedDistance.value = Math.max(
                movedDistance.value,
                Math.abs(horizontalTranslation),
                Math.abs(verticalTranslation),
            );
        },
        onFinalize: finishGesture,
    });

    const setTrackWidth = (width: number) => {
        trackWidth.value = width;
        setDistortionTrackWidth(width);
    };

    return {
        activeItemStyle,
        activePillClipStyle,
        activePillMaskStyle,
        gesture,
        panelStyle,
        pillClipStyle,
        pillMaskStyle,
        pressedStyle,
        selectedTouchFeedbackStyle,
        setTrackWidth,
        tabbarStyle,
        touchFeedbackStyle,
    };
};
