import { Size } from "@/components/tab-item";
import { useState } from "react";
import { usePanGesture } from "react-native-gesture-handler";
import { PanHandlerData } from "react-native-gesture-handler/lib/typescript/v3/hooks/gestures/pan/PanTypes";
import { GestureEndEvent } from "react-native-gesture-handler/lib/typescript/v3/types";
import {
    clamp,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useFrameCallback,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

const FRONT_EDGE_SPRING = { mass: 0.32, stiffness: 520, damping: 32 };
const TRAILING_EDGE_SPRING = { mass: 0.72, stiffness: 230, damping: 21 };
const SETTLE_SPRING = { mass: 0.48, stiffness: 370, damping: 22 };
const PRESS_SPRING = { mass: 0.22, stiffness: 600, damping: 38 };
const SQUISH_SPRING = { mass: 0.22, stiffness: 600, damping: 38 };

const PILL_WIDTH = 96;
const HALF_WIDTH = PILL_WIDTH / 2;
const INERTIA_DECAY_PER_MS = 0.015;
const IDLE_TIMEOUT_MS = 500;

const emptySize: Size = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
};

export const snapPoint = (
    value: number,
    velocity: number,
    points: ReadonlyArray<number>,
): number => {
    "worklet";
    const point = value + 0.2 * velocity;
    const deltas = points.map((p) => Math.abs(point - p));
    const minDelta = Math.min.apply(null, deltas);
    return points.filter((p) => Math.abs(point - p) === minDelta)[0];
};

export const usePillJelly = () => {
    const [trackWidth, setTrackWidth] = useState(0);
    const centerX = useSharedValue(HALF_WIDTH);
    const leftEdge = useSharedValue(0);
    const rightEdge = useSharedValue(PILL_WIDTH);
    const scaleY = useSharedValue(1);
    const scaleX = useSharedValue(1);
    const pointerDownY = useSharedValue(0);
    const [tabSizes, setTabSizes] = useState<Size[]>(
        new Array(3).fill(0).map((_) => emptySize),
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const inertiaX = useSharedValue(0);
    const timeoutId = useSharedValue(-1);

    const snapPoints = tabSizes.map((tab, i) => tab.width / 2 + tab.x);

    const moveTo = (x: number, velocityX: number) => {
        "worklet";
        const clamped = clamp(x, HALF_WIDTH, trackWidth - HALF_WIDTH);
        const movingRight = clamped >= centerX.value;

        const speed = Math.abs(velocityX);
        inertiaX.value = Math.max(
            inertiaX.value,
            interpolate(speed, [0, 1200], [0, 2], Extrapolation.CLAMP),
        );

        if (movingRight) {
            rightEdge.value = withSpring(
                clamped + HALF_WIDTH,
                FRONT_EDGE_SPRING,
            );
            leftEdge.value = withSpring(
                clamped - HALF_WIDTH,
                TRAILING_EDGE_SPRING,
            );
        } else {
            leftEdge.value = withSpring(
                clamped - HALF_WIDTH,
                FRONT_EDGE_SPRING,
            );
            rightEdge.value = withSpring(
                clamped + HALF_WIDTH,
                TRAILING_EDGE_SPRING,
            );
        }
        centerX.value = clamped;
    };

    const end = (e: GestureEndEvent<PanHandlerData>) => {
        "worklet";
        const snap = snapPoint(centerX.value, 0, snapPoints);
        const snapIndex = snapPoints.indexOf(snap);

        leftEdge.value = withSpring(snap - HALF_WIDTH, SETTLE_SPRING);
        rightEdge.value = withSpring(snap + HALF_WIDTH, SETTLE_SPRING);
        centerX.value = snap;
        // scaleY.value = withSpring(1, SETTLE_SPRING);
        scaleX.value = withSpring(1, SETTLE_SPRING);
        runOnJS(setCurrentIndex)(snapIndex ?? 0);
    };

    const pillStyle = useAnimatedStyle(() => {
        const width = rightEdge.value - leftEdge.value;
        const centerOffset =
            (leftEdge.value + rightEdge.value) / 2 - HALF_WIDTH;
        return {
            transform: [
                { translateX: centerOffset },
                { scaleX: (width / PILL_WIDTH) * scaleX.value },
                { scaleY: scaleY.value },
            ],
        };
    });

    const updateTabSize = (index: number, newValue: Size) => {
        setTabSizes((oldValue) => {
            const copy = [...oldValue];
            copy[index] = newValue;
            return copy;
        });
    };

    const activateFrame = () => {
        frameCallback.setActive(true);
    };

    const deactivateFrame = () => {
        frameCallback.setActive(false);
    };

    const frameCallback = useFrameCallback((frameInfo) => {
        const dt = frameInfo.timeSincePreviousFrame ?? 16.6;
        const inertia = clamp(inertiaX.value - dt * INERTIA_DECAY_PER_MS, 0, 1);
        inertiaX.value = inertia;
        const baseValue = interpolate(pointerDownY.value, [0, 1], [0, 0.1]);

        scaleY.value = withSpring(1 + baseValue - inertia * 0.3, SQUISH_SPRING);
    }, false);

    const gesture = usePanGesture({
        onBegin: () => {
            if (timeoutId.value !== -1) {
                clearTimeout(timeoutId.value);
                timeoutId.value = -1;
            }
            runOnJS(activateFrame)();
        },
        onTouchesDown: (e) => {
            inertiaX.value = 99;
            pointerDownY.value = 1;
            scaleX.value = withSpring(1.12, PRESS_SPRING);
            const touchX = e.allTouches[0].x;
            const clamped = clamp(touchX, HALF_WIDTH, trackWidth - HALF_WIDTH);
            leftEdge.value = withSpring(clamped - HALF_WIDTH, PRESS_SPRING);
            rightEdge.value = withSpring(clamped + HALF_WIDTH, PRESS_SPRING);
            centerX.value = clamped;
        },
        onTouchesUp: (e) => {
            pointerDownY.value = 0;
        },
        onUpdate: (e) => {
            moveTo(e.x, e.velocityX);
        },
        onFinalize: (e) => {
            end(e);
            timeoutId.value = setTimeout(() => {
                runOnJS(deactivateFrame)();
                timeoutId.value = -1;
            }, IDLE_TIMEOUT_MS);
        },
    });

    return { currentIndex, gesture, setTrackWidth, updateTabSize, pillStyle };
};
