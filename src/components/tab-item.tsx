import { cloneElement, ReactElement } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

export interface TabItemProps {
    displayScale?: number;
    icon: ReactElement;
    text: string;
    isActive?: boolean;
    animatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export const TabItem = ({
    displayScale = 1,
    icon,
    text,
    isActive = false,
    animatedStyle,
}: TabItemProps) => {
    const color = isActive ? "#000000" : "#888888";

    return (
        <Animated.View
            style={[
                styles.item,
                { height: 56 * displayScale },
                animatedStyle,
            ]}
        >
            <View style={[styles.content]}>
                <View
                    style={{
                        transform: [{ translateY: 2 * displayScale }],
                    }}
                >
                    {cloneElement(icon as ReactElement<any>, {
                        color,
                    })}
                </View>
                <Text
                    style={[
                        {
                            color,
                            fontSize: 13 * displayScale,
                            fontWeight: isActive ? "700" : "400",
                            transform: [
                                { translateY: -4 * displayScale },
                            ],
                        },
                    ]}
                >
                    {text}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    item: {
        flex: 1,
        zIndex: 1,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
