import {
    type StyleProp,
    StyleSheet,
    type ViewStyle,
} from "react-native";
import Animated, {
    type AnimatedStyle,
} from "react-native-reanimated";
import Svg, {
    Defs,
    RadialGradient,
    Rect,
    Stop,
} from "react-native-svg";

export interface TouchFeedbackProps {
    animatedStyle: StyleProp<AnimatedStyle<ViewStyle>>;
    centerOpacity: number;
    color?: string;
    diameter: number;
    gradientId: string;
    middleOpacity: number;
    offsetX?: number;
    offsetY?: number;
    radius: number;
}

export const TouchFeedback = ({
    animatedStyle,
    centerOpacity,
    color = "#ffffff",
    diameter,
    gradientId,
    middleOpacity,
    offsetX = 0,
    offsetY = 0,
    radius,
}: TouchFeedbackProps) => (
    <Animated.View
        style={[
            styles.root,
            {
                height: diameter,
                left: offsetX,
                top: offsetY,
                width: diameter,
            },
            animatedStyle,
        ]}
    >
        <Svg height={diameter} width={diameter}>
            <Defs>
                <RadialGradient
                    id={gradientId}
                    cx={radius}
                    cy={radius}
                    fx={radius}
                    fy={radius}
                    gradientUnits="userSpaceOnUse"
                    r={radius}
                >
                    <Stop
                        offset="0%"
                        stopColor={color}
                        stopOpacity={centerOpacity}
                    />
                    <Stop
                        offset="45%"
                        stopColor={color}
                        stopOpacity={middleOpacity}
                    />
                    <Stop
                        offset="100%"
                        stopColor={color}
                        stopOpacity={0}
                    />
                </RadialGradient>
            </Defs>
            <Rect
                fill={`url(#${gradientId})`}
                height={diameter}
                width={diameter}
            />
        </Svg>
    </Animated.View>
);

const styles = StyleSheet.create({
    root: {
        position: "absolute",
        left: 0,
        top: 0,
    },
});
