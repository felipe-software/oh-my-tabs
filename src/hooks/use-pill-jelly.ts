import { useDistortion } from "@/hooks/use-distortion";
import {
    getHorizontalPanelOffset,
    getTabWidth,
} from "@/utils/animation";
import {
    advancePillJellyFrame,
    type PillJellyFrameConfig,
    type PillJellyFrameState,
} from "@/utils/pill-jelly-animation";
import { usePanGesture } from "react-native-gesture-handler";
import {
    clamp,
    useAnimatedStyle,
    useDerivedValue,
    useFrameCallback,
    useSharedValue,
} from "react-native-reanimated";

const TAB_COUNT = 4;
const TRACK_INSET = 4;
const PRESSED_SCALE = 1.3;
const SNAP_ON_POINTER_DOWN = true;

/**
 * These are the exact stiffness/damping-ratio pairs used by
 * AndroidLiquidGlass' DampedDragAnimation.
 */
const FRAME_CONFIG = {
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
    tabCount: TAB_COUNT,
} as const satisfies PillJellyFrameConfig;

export const usePillJelly = (recording = false, displayScale = 1) => {
    const geometryScale = displayScale > 0 ? displayScale : 1;
    const trackInset = TRACK_INSET * geometryScale;
    const {
        begin: beginTabbarInteraction,
        end: endTabbarInteraction,
        pressedStyle,
        setTrackWidth: setDistortionTrackWidth,
        tabbarStyle,
        update: updateDistortion,
    } = useDistortion(geometryScale);
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
            FRAME_CONFIG,
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

    const surfaceStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: panelOffset.value }],
    }));

    const panelStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: panelOffset.value }],
    }));

    const pillMaskStyle = useAnimatedStyle(() => {
        const tabWidth = getTabWidth(
            trackWidth.value,
            trackInset,
            TAB_COUNT,
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
    });

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
            TAB_COUNT,
        );
        let nextIndex: number;

        if (movedDistance.value < 4 && tabWidth > 0) {
            // A stationary gesture is a regular tab click. A moving gesture
            // remains relative, so every point of the bar acts as a handle.
            nextIndex = Math.floor((downX.value - trackInset) / tabWidth);
        } else {
            nextIndex = Math.round(targetValue.value);
        }

        nextIndex = clamp(nextIndex, 0, TAB_COUNT - 1);
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
            const absoluteX = recording
                ? firstTouch.absoluteY
                : firstTouch.absoluteX;

            beginTabbarInteraction(localX, absoluteX);
            downX.value = localX;
            movedDistance.value = 0;

            const tabWidth = getTabWidth(
                trackWidth.value,
                trackInset,
                TAB_COUNT,
            );
            if (SNAP_ON_POINTER_DOWN && tabWidth > 0) {
                targetValue.value = clamp(
                    Math.floor((localX - trackInset) / tabWidth),
                    0,
                    TAB_COUNT - 1,
                );
            }

            dragStartTarget.value = targetValue.value;
            dragStartPanelOffset.value = rawPanelOffset.value;
            isDragging.value = 1;
            releasePending.value = 0;
            pressTarget.value = 1;
            shapeTarget.value = PRESSED_SCALE;
            rawPanelOffsetVelocity.value = 0;
        },
        onUpdate: (event) => {
            const tabWidth = getTabWidth(
                trackWidth.value,
                trackInset,
                TAB_COUNT,
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
                TAB_COUNT - 1,
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
        gesture,
        panelStyle,
        pillMaskStyle,
        pressedStyle,
        setTrackWidth,
        surfaceStyle,
        tabbarStyle,
    };
};
