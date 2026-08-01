import { GestureDetector } from "react-native-gesture-handler";
import { usePanGesture } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    clamp,
    Extrapolation,
    interpolate,
} from "react-native-reanimated";
import { cloneElement, ReactElement, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const FRONT_EDGE_SPRING = { mass: 0.32, stiffness: 520, damping: 32 };
const TRAILING_EDGE_SPRING = { mass: 0.72, stiffness: 230, damping: 21 };
const SETTLE_SPRING = { mass: 0.48, stiffness: 370, damping: 22 };
const PRESS_SPRING = { mass: 0.22, stiffness: 600, damping: 38 };
const SCALE_Y_SPRING = { mass: 0.22, stiffness: 600, damping: 38 };

const PILL_WIDTH = 96;
const HALF_WIDTH = PILL_WIDTH / 2;
import {
    HorseIcon,
    HeartIcon,
    CubeIcon,
    AndroidLogoIcon,
    GearIcon,
    GearSixIcon,
    HouseLineIcon,
    HouseIcon,
    ApertureIcon,
    ImagesIcon,
    ImagesSquareIcon,
} from "phosphor-react-native";

const TabItem = ({ icon, text }: { icon: ReactElement; text: string }) => {
    return (
        <Animated.View style={{ flex: 1 }}>
            <Pressable
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    // backgroundColor: "red",
                }}
            >
                <View style={{ transform: [{ scale: 1.1 }, { translateY: 2 }] }}>{icon}</View>
                <Text
                    style={{
                        // lineHeight: 14,
                        fontSize: 14,
                        transform: [{ translateY: 2 }],
                    }}
                >
                    {text}
                </Text>
            </Pressable>
        </Animated.View>
    );
};

export default function HomeScreen() {
    const [trackWidth, setTrackWidth] = useState(0);
    const centerX = useSharedValue(HALF_WIDTH);
    const leftEdge = useSharedValue(0);
    const rightEdge = useSharedValue(PILL_WIDTH);
    const scaleY = useSharedValue(1);

    const BOUNCE_SPRING = { mass: 0.5, stiffness: 280, damping: 12 };

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
    };

    const end = () => {
        "worklet";
        leftEdge.value = withSpring(centerX.value - HALF_WIDTH, SETTLE_SPRING);
        rightEdge.value = withSpring(centerX.value + HALF_WIDTH, SETTLE_SPRING);
        scaleY.value = withSpring(1, SCALE_Y_SPRING);
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
        onFinalize: () => {
            end();
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

    return (
        <GestureDetector gesture={gesture}>
            <SafeAreaView
                style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}
            >
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
                        text="Home"
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
                        text="Camera"
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
                        text="Settings"
                    />
                </View>
            </SafeAreaView>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    track: {
        position: "relative",
        width: "100%",
        height: 64,
        backgroundColor: "#1f1f1f",
        alignItems: "center",
        padding: 4,
        borderRadius: 32,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        // paddingHorizontal: 16
    },
    pill: {
        position: "absolute",
        width: PILL_WIDTH,
        left: 0,
        height: "100%",
        backgroundColor: "#c0c0c0",
        borderRadius: 999,
    },
});
