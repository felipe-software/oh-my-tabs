import {
    TABBAR_LAYOUT,
    type TabBarColors,
} from "../constants";
import type { ComponentType } from "react";
import {
    type StyleProp,
    StyleSheet,
    Text,
    View,
    type ViewStyle,
} from "react-native";
import Animated, { type AnimatedStyle } from "react-native-reanimated";

export interface TabsIconProps {
    color: string;
    colors: Readonly<TabBarColors>;
    isMasked: boolean;
    isSelected: boolean;
    opacity: number;
    size: number;
}

export type TabsIcon = ComponentType<TabsIconProps>;

export interface TabItemProps {
    activeColor?: string;
    activeOpacity?: number;
    displayScale?: number;
    colors: Readonly<TabBarColors>;
    icon: TabsIcon;
    iconSize?: number;
    inactiveColor?: string;
    inactiveOpacity?: number;
    itemHeight?: number;
    text: string;
    isActive?: boolean;
    isMasked?: boolean;
    animatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
}

export const TabItem = ({
    activeColor = "#000000",
    activeOpacity = 1,
    colors,
    displayScale = 1,
    icon,
    iconSize,
    inactiveColor = "#afafaf",
    inactiveOpacity = 1,
    itemHeight = TABBAR_LAYOUT.itemHeight * displayScale,
    text,
    isActive = false,
    isMasked = false,
    animatedStyle,
}: TabItemProps) => {
    const color = isActive ? activeColor : inactiveColor;
    const opacity = isActive ? activeOpacity : inactiveOpacity;
    const Icon = icon;

    return (
        <Animated.View
            style={[
                styles.item,
                {
                    height: itemHeight,
                },
                animatedStyle,
            ]}
        >
            <View style={[styles.content, { opacity }]}>
                <View
                    style={{
                        transform: [{ translateY: 2 * displayScale }],
                    }}
                >
                    <Icon
                        color={color}
                        colors={colors}
                        isMasked={isMasked}
                        isSelected={isActive}
                        opacity={opacity}
                        size={
                            iconSize ??
                            TABBAR_LAYOUT.iconSize * displayScale
                        }
                    />
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
