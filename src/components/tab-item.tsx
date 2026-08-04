import { cloneElement, ReactElement } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

export interface TabItemProps {
    icon: ReactElement;
    text: string;
    isActive?: boolean;
    animatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export const TabItem = ({
    icon,
    text,
    isActive = false,
    animatedStyle,
}: TabItemProps) => {
    const color = isActive ? "#000000" : "#888888";

    return (
        <Animated.View style={[styles.item, animatedStyle]}>
            <View style={styles.content}>
                <View style={styles.icon}>
                    {cloneElement(icon as ReactElement<any>, {
                        color,
                        weight: isActive ? "fill" : "duotone",
                    })}
                </View>
                <Text
                    style={[
                        styles.label,
                        {
                            color,
                            fontWeight: isActive ? "700" : "400",
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
        height: 56,
        zIndex: 1,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
    },
    icon: {
        transform: [{ scale: 1.1 }, { translateY: 2 }],
    },
    label: {
        fontSize: 14,
        transform: [{ translateY: 2 }],
    },
});
