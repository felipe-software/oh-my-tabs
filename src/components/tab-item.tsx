import { TABBAR_LAYOUT } from "../constants";
import { cloneElement, type ReactElement } from "react";
import {
    type StyleProp,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

export interface TabsIconProps {
    color?: string;
    size?: number;
}

export interface TabItemProps {
    activeColor?: string;
    displayScale?: number;
    icon: ReactElement<TabsIconProps>;
    iconSize?: number;
    inactiveColor?: string;
    text: string;
    isActive?: boolean;
    animatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export const TabItem = ({
    activeColor = "#000000",
    displayScale = 1,
    icon,
    iconSize,
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
                    {cloneElement(icon, {
                        color,
                        ...(iconSize === undefined ? {} : { size: iconSize }),
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
