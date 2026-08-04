import NativeMaskedView from "@react-native-masked-view/masked-view";
import type { PropsWithChildren } from "react";
import {
    Platform,
    type StyleProp,
    StyleSheet,
    type ViewStyle,
} from "react-native";
import Animated, {
    type AnimatedStyle,
} from "react-native-reanimated";

export interface PillMaskedViewProps extends PropsWithChildren {
    animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
    clipStyle: StyleProp<AnimatedStyle<ViewStyle>>;
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
        style={[
            styles.mask,
            { height, left, top },
            animatedStyle,
        ]}
    />
);

export const PillMaskedView = ({
    animatedStyle,
    children,
    clipStyle,
    height,
    left,
    top,
}: PillMaskedViewProps) => {
    if (Platform.OS === "web") {
        return (
            <Animated.View
                style={[StyleSheet.absoluteFill, clipStyle]}
            >
                {children}
            </Animated.View>
        );
    }

    return (
        <NativeMaskedView
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
            {children}
        </NativeMaskedView>
    );
};

const styles = StyleSheet.create({
    mask: {
        position: "absolute",
        backgroundColor: "#000000",
        borderRadius: 999,
    },
});
