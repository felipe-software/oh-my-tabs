import { useTabbarDistortion } from "@/hooks/use-tabbar-distortion";
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
const PRESSED_SCALE = 78 / 56;

/**
 * These are the exact stiffness/damping-ratio pairs used by
 * AndroidLiquidGlass' DampedDragAnimation.
 */
const VALUE_SPRING = { stiffness: 1_000, dampingRatio: 1 };
const VELOCITY_SPRING = { stiffness: 300, dampingRatio: 0.5 };
const PRESS_SPRING = { stiffness: 1_000, dampingRatio: 1 };
const SCALE_X_SPRING = { stiffness: 250, dampingRatio: 0.6 };
const SCALE_Y_SPRING = { stiffness: 250, dampingRatio: 0.7 };
const PANEL_SPRING = { stiffness: 300, dampingRatio: 1 };

type SpringStep = {
    value: number;
    velocity: number;
};

/**
 * Advances the same unit-mass damped spring model used by Compose's
 * SpringSpec. Solving the spring analytically keeps it stable on both 60 Hz
 * and 120 Hz displays and lets us retain the real value velocity.
 */
const advanceSpring = (
    value: number,
    velocity: number,
    target: number,
    stiffness: number,
    dampingRatio: number,
    deltaSeconds: number,
): SpringStep => {
    "worklet";

    const displacement = value - target;
    if (Math.abs(displacement) < 0.0001 && Math.abs(velocity) < 0.0001) {
        return { value: target, velocity: 0 };
    }

    const naturalFrequency = Math.sqrt(stiffness);

    if (dampingRatio === 1) {
        const decay = Math.exp(-naturalFrequency * deltaSeconds);
        const coefficient = velocity + naturalFrequency * displacement;

        return {
            value:
                target +
                (displacement + coefficient * deltaSeconds) * decay,
            velocity:
                (velocity -
                    naturalFrequency * coefficient * deltaSeconds) *
                decay,
        };
    }

    const dampedFrequency =
        naturalFrequency * Math.sqrt(1 - dampingRatio * dampingRatio);
    const decay = Math.exp(
        -dampingRatio * naturalFrequency * deltaSeconds,
    );
    const angle = dampedFrequency * deltaSeconds;
    const cosine = Math.cos(angle);
    const sine = Math.sin(angle);

    return {
        value:
            target +
            decay *
                (displacement * cosine +
                    ((velocity +
                        dampingRatio * naturalFrequency * displacement) /
                        dampedFrequency) *
                        sine),
        velocity:
            decay *
            (velocity * cosine -
                ((dampingRatio * naturalFrequency * velocity +
                    naturalFrequency * naturalFrequency * displacement) /
                    dampedFrequency) *
                    sine),
    };
};

/** Compose's EaseOut is CubicBezierEasing(0, 0, 0.58, 1). */
const easeOut = (input: number): number => {
    "worklet";

    const x = clamp(input, 0, 1);
    let low = 0;
    let high = 1;
    let parameter = x;

    // Invert the bezier's x component, then evaluate its y component.
    for (let iteration = 0; iteration < 10; iteration += 1) {
        const inverse = 1 - parameter;
        const bezierX =
            3 * inverse * parameter * parameter * 0.58 +
            parameter * parameter * parameter;

        if (bezierX < x) {
            low = parameter;
        } else {
            high = parameter;
        }
        parameter = (low + high) / 2;
    }

    const inverse = 1 - parameter;
    return (
        3 * inverse * parameter * parameter +
        parameter * parameter * parameter
    );
};

const getHorizontalPanelOffset = (
    rawOffset: number,
    trackWidth: number,
    geometryScale: number,
): number => {
    "worklet";

    if (trackWidth <= 0) {
        return 0;
    }

    const fraction = clamp(rawOffset / trackWidth, -1, 1);
    if (fraction === 0) {
        return 0;
    }

    return (
        Math.sign(fraction) *
        4 *
        geometryScale *
        easeOut(Math.abs(fraction))
    );
};

export const usePillJelly = (recording = false, displayScale = 1) => {
    const geometryScale = displayScale > 0 ? displayScale : 1;
    const trackInset = TRACK_INSET * geometryScale;
    const {
        begin: beginDistortion,
        end: endDistortion,
        setTrackWidth: setDistortionTrackWidth,
        tabbarStyle,
        update: updateDistortion,
    } = useTabbarDistortion(geometryScale);
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

    useFrameCallback(({ timeSincePreviousFrame }) => {
        "worklet";

        if (timeSincePreviousFrame === null) {
            return;
        }

        // Ignore very large debugger/background gaps without changing the
        // spring response during normal frames.
        const deltaSeconds = Math.min(timeSincePreviousFrame / 1_000, 0.064);

        const valueStep = advanceSpring(
            value.value,
            valueVelocity.value,
            targetValue.value,
            VALUE_SPRING.stiffness,
            VALUE_SPRING.dampingRatio,
            deltaSeconds,
        );
        value.value = valueStep.value;
        valueVelocity.value = valueStep.velocity;

        const velocityTarget =
            isDragging.value === 1
                ? valueVelocity.value / (TAB_COUNT - 1)
                : 0;
        const velocityStep = advanceSpring(
            filteredVelocity.value,
            filteredVelocityRate.value,
            velocityTarget,
            VELOCITY_SPRING.stiffness,
            VELOCITY_SPRING.dampingRatio,
            deltaSeconds,
        );
        filteredVelocity.value = velocityStep.value;
        filteredVelocityRate.value = velocityStep.velocity;

        if (isDragging.value === 0) {
            const panelStep = advanceSpring(
                rawPanelOffset.value,
                rawPanelOffsetVelocity.value,
                0,
                PANEL_SPRING.stiffness,
                PANEL_SPRING.dampingRatio,
                deltaSeconds,
            );
            rawPanelOffset.value = panelStep.value;
            rawPanelOffsetVelocity.value = panelStep.velocity;
        }

        // AndroidLiquidGlass keeps the indicator inflated until its position
        // is within 2.5% of the selected snap point.
        if (
            releasePending.value === 1 &&
            Math.abs(value.value - targetValue.value) <
                (TAB_COUNT - 1) * 0.025
        ) {
            releasePending.value = 0;
            pressTarget.value = 0;
            shapeTarget.value = 1;
        }

        const pressStep = advanceSpring(
            pressProgress.value,
            pressProgressRate.value,
            pressTarget.value,
            PRESS_SPRING.stiffness,
            PRESS_SPRING.dampingRatio,
            deltaSeconds,
        );
        pressProgress.value = pressStep.value;
        pressProgressRate.value = pressStep.velocity;

        const scaleXStep = advanceSpring(
            baseScaleX.value,
            baseScaleXRate.value,
            shapeTarget.value,
            SCALE_X_SPRING.stiffness,
            SCALE_X_SPRING.dampingRatio,
            deltaSeconds,
        );
        baseScaleX.value = scaleXStep.value;
        baseScaleXRate.value = scaleXStep.velocity;

        const scaleYStep = advanceSpring(
            baseScaleY.value,
            baseScaleYRate.value,
            shapeTarget.value,
            SCALE_Y_SPRING.stiffness,
            SCALE_Y_SPRING.dampingRatio,
            deltaSeconds,
        );
        baseScaleY.value = scaleYStep.value;
        baseScaleYRate.value = scaleYStep.velocity;
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
        const tabWidth = Math.max(
            0,
            (trackWidth.value - trackInset * 2) / TAB_COUNT,
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
        endDistortion();

        const tabWidth =
            (trackWidth.value - trackInset * 2) / TAB_COUNT;
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

            beginDistortion(localX, absoluteX);
            downX.value = localX;
            movedDistance.value = 0;
            dragStartTarget.value = targetValue.value;
            dragStartPanelOffset.value = rawPanelOffset.value;
            isDragging.value = 1;
            releasePending.value = 0;
            pressTarget.value = 1;
            shapeTarget.value = PRESSED_SCALE;
            rawPanelOffsetVelocity.value = 0;
        },
        onUpdate: (event) => {
            const tabWidth =
                (trackWidth.value - trackInset * 2) / TAB_COUNT;
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
        setTrackWidth,
        surfaceStyle,
        tabbarStyle,
    };
};
