import { cloneElement, ReactElement } from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

export interface Size {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface TabItemProps {
    icon: ReactElement;
    text: string;
    onMeasure?: (s: Size) => void;
    isActive: boolean;
}

export const TabItem = ({ icon, text, onMeasure, isActive }: TabItemProps) => {
    const activeColor = "#000000"
    return (
        <Animated.View
            style={{ flex: 1, maxWidth: 96, zIndex: 1 }}
            onLayout={(e) => {
                e.target.measure((x, y, width, height) => {
                    onMeasure?.({ x, y, width, height });
                });
            }}
        >
            <Pressable
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                }}
            >
                <View
                    style={{ transform: [{ scale: 1.1 }, { translateY: 2 }] }}
                >
                    {cloneElement(icon as ReactElement<any>, {
                        color: isActive ? activeColor : "#888",
                        weight: isActive ? "fill" : "duotone",
                    })}
                </View>
                <Text
                    style={{
                        fontSize: 14,
                        transform: [{ translateY: 2 }],
                        color: isActive ? activeColor : "#888",
                        fontWeight: isActive ? "700" : "400",
                    }}
                >
                    {text}
                </Text>
            </Pressable>
        </Animated.View>
    );
};
