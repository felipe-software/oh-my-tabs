import { TABBAR_LAYOUT } from "@/constants";
import { cloneElement, ReactElement } from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import Animated, { AnimatedStyle } from "react-native-reanimated";

export interface TabItemProps {
    activeColor?: string;
    displayScale?: number;
    icon: ReactElement;
    inactiveColor?: string;
    text: string;
    isActive?: boolean;
    animatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export const TabItem = ({
    activeColor = "#000000",
    displayScale = 1,
    icon,
    inactiveColor = "#afafaf",
    text,
    isActive = false,
    animatedStyle,
}: TabItemProps) => {
    const color = isActive ? activeColor : inactiveColor;

    return (
        <Animated.View
            style={[
                styles.item,
                {
                    height:
                        TABBAR_LAYOUT.itemHeight * displayScale,
                },
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
                            // transform: [
                            //     { translateY: -4 * displayScale },
                            // ],
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
