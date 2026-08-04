import { getPointerOrigin, rubberBand } from "@/utils/animation";
import {
    cancelAnimation,
    clamp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const TRACK_HEIGHT = 64;
const TABBAR_PRESSED_SCALE = 1.025;

const VERTICAL_DRAG = {
    distortion: 0.08, // 0..1
    // distortion: 0.12, // 0..1
    distanceForMaxDistortion: 700,

    // Movement only: these change how much the tabbar follows the finger,
    // without changing its width distortion.
    follow: 0.25,
    rubberBand: 0.28 / 2,
} as const;

const SPRING = {
    damping: 18,
    mass: 0.9,
    stiffness: 240,
};

export const useDistortion = (displayScale = 1) => {
    const geometryScale = displayScale > 0 ? displayScale : 1;
    const trackHeight = TRACK_HEIGHT * geometryScale;
    const distanceForMaxDistortion =
        VERTICAL_DRAG.distanceForMaxDistortion * geometryScale;

    const trackWidth = useSharedValue(0);
    const translateY = useSharedValue(0);
    const dragOriginY = useSharedValue(0);
    const scaleX = useSharedValue(1);
    const pressedScale = useSharedValue(1);

    const pointerInitialLocalX = useSharedValue(0);
    const pointerInitialAbsoluteX = useSharedValue(0);
    const transformOriginX = useSharedValue(0);

    const begin = (localX: number, absoluteX: number) => {
        "worklet";

        cancelAnimation(translateY);
        cancelAnimation(scaleX);
        cancelAnimation(pressedScale);

        dragOriginY.value = translateY.value;
        pressedScale.value = withSpring(TABBAR_PRESSED_SCALE, SPRING);
        pointerInitialLocalX.value = localX;
        pointerInitialAbsoluteX.value = absoluteX;
        transformOriginX.value = clamp(localX, 0, trackWidth.value);
    };

    const update = (verticalTranslation: number, absoluteX: number) => {
        "worklet";

        const appliedTranslation =
            rubberBand(
                verticalTranslation,
                trackHeight,
                VERTICAL_DRAG.rubberBand,
            ) * VERTICAL_DRAG.follow;
        const progress = Math.min(
            Math.abs(verticalTranslation) / distanceForMaxDistortion,
            1,
        );

        translateY.value = dragOriginY.value + appliedTranslation;
        scaleX.value = 1 - progress * VERTICAL_DRAG.distortion;
        transformOriginX.value = getPointerOrigin(
            absoluteX,
            trackWidth.value,
            pointerInitialAbsoluteX.value,
            pointerInitialLocalX.value,
        );
    };

    const end = () => {
        "worklet";

        translateY.value = withSpring(0, SPRING);
        scaleX.value = withSpring(1, SPRING);
        pressedScale.value = withSpring(1, SPRING);
    };

    const setTrackWidth = (width: number) => {
        trackWidth.value = width;
        transformOriginX.value = width / 2;
    };

    const tabbarStyle = useAnimatedStyle(() => ({
        transformOrigin: [
            transformOriginX.value,
            trackHeight / 2,
            0,
        ] as [number, number, number],
        transform: [
            { translateY: translateY.value },
            { scaleX: scaleX.value },
        ],
    }));

    const pressedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressedScale.value }],
    }));

    return {
        begin,
        end,
        pressedStyle,
        setTrackWidth,
        tabbarStyle,
        update,
    };
};
