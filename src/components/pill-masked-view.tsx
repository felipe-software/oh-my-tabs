import NativeMaskedView from "@react-native-masked-view/masked-view";
import type { PropsWithChildren } from "react";
import {
    Platform,
    type StyleProp,
    StyleSheet,
    type ViewStyle,
} from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

export interface PillMaskedViewProps extends PropsWithChildren {
    animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
    clipStyle: StyleProp<AnimatedStyle<ViewStyle>>;
    contentCanvasStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
    contentClipStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
    height: number;
    left: number;
    top: number;
}

const PillMaskElement = ({
    animatedStyle,
    height,
    left,
    top,
}: Omit<PillMaskedViewProps, "children" | "clipStyle">) => (
    <Animated.View
        style={[styles.mask, { height, left, top }, animatedStyle]}
    />
);

export const PillMaskedView = ({
    animatedStyle,
    children,
    clipStyle,
    contentCanvasStyle,
    contentClipStyle,
    height,
    left,
    top,
}: PillMaskedViewProps) => {
    if (Platform.OS === "web") {
        return (
            <Animated.View style={[StyleSheet.absoluteFill, clipStyle]}>
                {children}
            </Animated.View>
        );
    }

    const content =
        Platform.OS === "android" &&
        contentClipStyle &&
        contentCanvasStyle ? (
            <Animated.View style={[styles.contentClip, contentClipStyle]}>
                <Animated.View
                    style={[styles.contentCanvas, contentCanvasStyle]}
                >
                    {children}
                </Animated.View>
            </Animated.View>
        ) : (
            children
        );

    return (
        <NativeMaskedView
            androidRenderingMode="hardware"
            style={StyleSheet.absoluteFill}
            maskElement={
                <PillMaskElement
                    animatedStyle={animatedStyle}
                    height={height}
                    left={left}
                    top={top}
                />
            }
        >
            {content}
        </NativeMaskedView>
    );
};

const styles = StyleSheet.create({
    mask: {
        position: "absolute",
        backgroundColor: "#000000",
        borderRadius: 999,
    },
    contentCanvas: {
        position: "absolute",
    },
    contentClip: {
        borderRadius: 999,
        position: "absolute",
    },
});
