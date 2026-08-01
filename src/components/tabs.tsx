import { Size, TabItem, TabItemProps } from "@/components/tab-item";
import {
    GearSixIcon,
    HouseIcon,
    ImagesSquareIcon,
} from "phosphor-react-native";
import { cloneElement, ReactElement, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GestureDetector, usePanGesture } from "react-native-gesture-handler";
import { PanHandlerData } from "react-native-gesture-handler/lib/typescript/v3/hooks/gestures/pan/PanTypes";
import { GestureEndEvent } from "react-native-gesture-handler/lib/typescript/v3/types";
import Animated, {
    cancelAnimation,
    clamp,
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

const FRONT_EDGE_SPRING = { mass: 0.32, stiffness: 520, damping: 32 };
const TRAILING_EDGE_SPRING = { mass: 0.72, stiffness: 230, damping: 21 };
const SETTLE_SPRING = { mass: 0.48, stiffness: 370, damping: 22 };
const PRESS_SPRING = { mass: 0.22, stiffness: 600, damping: 38 };
const SCALE_Y_SPRING = { mass: 0.22, stiffness: 600, damping: 38 };

const PILL_WIDTH = 96;
const HALF_WIDTH = PILL_WIDTH / 2;

const emptySize: Size = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
};

// Taken from wcandillon/react-native-redash
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

export const Tabs = () => {
    const [trackWidth, setTrackWidth] = useState(0);
    const centerX = useSharedValue(HALF_WIDTH);
    const leftEdge = useSharedValue(0);
    const rightEdge = useSharedValue(PILL_WIDTH);
    const scaleY = useSharedValue(1);
    const [tabSizes, setTabSizes] = useState<Size[]>(
        new Array(3).fill(0).map((_) => emptySize),
    );
    const [currentIndex, setCurrentIndex] = useState(0);

    const snapPoints = tabSizes.map((tab, i) => tab.width / 2 + tab.x);

    useEffect(() => {
        
    }, [snapPoints])

    const moveTo = (x: number, velocityX: number) => {
        "worklet";
        const clamped = clamp(x, HALF_WIDTH, trackWidth - HALF_WIDTH);
        const movingRight = clamped >= centerX.value;

        const speed = Math.abs(velocityX);
        scaleY.value = withSpring(
            interpolate(speed, [0, 1200], [1.3, 0.7], Extrapolation.CLAMP),
            SCALE_Y_SPRING,
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

        // const snap = snapPoint(centerX.value, velocityX, snapPoints);
        // const snapIndex = snapPoints.indexOf(snap);
        // runOnJS(setCurrentIndex)(snapIndex ?? 0);
    };

    const end = (e: GestureEndEvent<PanHandlerData>) => {
        "worklet";
        leftEdge.value = withSpring(centerX.value - HALF_WIDTH, SETTLE_SPRING);
        rightEdge.value = withSpring(centerX.value + HALF_WIDTH, SETTLE_SPRING);
        const snap = snapPoint(centerX.value, 0, snapPoints);
        const snapIndex = snapPoints.indexOf(snap);

        leftEdge.value = withSpring(snap - HALF_WIDTH, SETTLE_SPRING);
        rightEdge.value = withSpring(snap + HALF_WIDTH, SETTLE_SPRING);
        centerX.value = snap;
        scaleY.value = withSpring(1, SCALE_Y_SPRING);
        runOnJS(setCurrentIndex)(snapIndex ?? 0);
    };

    const gesture = usePanGesture({
        onTouchesDown: (e) => {
            scaleY.value = withSpring(1.2, SCALE_Y_SPRING);
            const touchX = e.allTouches[0].x;
            const clamped = clamp(touchX, HALF_WIDTH, trackWidth - HALF_WIDTH);
            leftEdge.value = withSpring(clamped - HALF_WIDTH, PRESS_SPRING);
            rightEdge.value = withSpring(clamped + HALF_WIDTH, PRESS_SPRING);
            centerX.value = clamped;
        },
        onUpdate: (e) => {
            moveTo(e.x, e.velocityX);
        },

        onFinalize: (e) => {
            end(e);
        },
    });

    const pillStyle = useAnimatedStyle(() => {
        const width = rightEdge.value - leftEdge.value;
        const centerOffset =
            (leftEdge.value + rightEdge.value) / 2 - HALF_WIDTH;
        return {
            transform: [
                { translateX: centerOffset },
                { scaleX: width / PILL_WIDTH },
                { scaleY: scaleY.value },
            ],
        };
    });

    const updateTab = (index: number, newValue: Size) => {
        console.log(index, newValue);
        setTabSizes((oldValue) => {
            const copy = [...oldValue];
            copy[index] = newValue;
            return copy;
        });
    };

    console.log({ currentIndex });

    // const tabs: TabItemProps = []

    return (
        <GestureDetector gesture={gesture}>
            <View
                style={styles.track}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            >
                <Animated.View style={[styles.pill, pillStyle]} />
                <TabItem
                    icon={
                        <HouseIcon
                            style={{
                                transform: [{ scale: 1.5 }],
                            }}
                            size={16}
                            weight="duotone"
                        />
                    }
                    isActive={currentIndex === 0}
                    text="Home"
                    onMeasure={(size) => updateTab(0, size)}
                />
                <TabItem
                    icon={
                        <ImagesSquareIcon
                            style={{
                                transform: [{ scale: 1.5 }],
                            }}
                            size={16}
                            weight="duotone"
                        />
                    }
                    isActive={currentIndex === 1}
                    text="Camera"
                    onMeasure={(size) => updateTab(1, size)}
                />
                <TabItem
                    icon={
                        <GearSixIcon
                            style={{
                                transform: [{ scale: 1.5 }],
                            }}
                            size={16}
                            weight="duotone"
                        />
                    }
                    isActive={currentIndex === 2}
                    text="Settings"
                    onMeasure={(size) => updateTab(2, size)}
                />
                {/* <TabItem
                    icon={
                        <GearSixIcon
                            style={{
                                transform: [{ scale: 1.5 }],
                            }}
                            size={16}
                            weight="duotone"
                        />
                    }
                    text="Settings"
                    onMeasure={(size) => updateTab(4, size)}
                /> */}
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    track: {
        position: "relative",
        // width: "fit-content",
        height: 64,
        backgroundColor: "#1f1f1f",
        alignItems: "center",
        padding: 4,
        borderRadius: 32,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "auto",
        flexGrow: 0
    },
    pill: {
        position: "absolute",
        width: PILL_WIDTH,
        left: 0,
        height: "100%",
        backgroundColor: "#c0c0c0",
        borderRadius: 999,
        zIndex: 0
    },
});
