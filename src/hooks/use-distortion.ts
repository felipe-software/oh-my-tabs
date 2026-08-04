import { DISTORTION, TABBAR_LAYOUT } from "@/constants";
import { getPointerOrigin, rubberBand } from "@/utils/animation";
import {
    cancelAnimation,
    clamp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

export const useDistortion = (displayScale = 1) => {
    const geometryScale = displayScale > 0 ? displayScale : 1;
    const trackHeight = TABBAR_LAYOUT.trackHeight * geometryScale;
    const distanceForMaxDistortion =
        DISTORTION.verticalDrag.distanceForMaxDistortion *
        geometryScale;

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
        pressedScale.value = withSpring(
            DISTORTION.pressedScale,
            DISTORTION.spring,
        );
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
                DISTORTION.verticalDrag.rubberBand,
            ) * DISTORTION.verticalDrag.follow;
        const progress = Math.min(
            Math.abs(verticalTranslation) / distanceForMaxDistortion,
            1,
        );

        translateY.value = dragOriginY.value + appliedTranslation;
        scaleX.value =
            1 - progress * DISTORTION.verticalDrag.distortion;
        transformOriginX.value = getPointerOrigin(
            absoluteX,
            trackWidth.value,
            pointerInitialAbsoluteX.value,
            pointerInitialLocalX.value,
        );
    };

    const end = () => {
        "worklet";

        translateY.value = withSpring(0, DISTORTION.spring);
        scaleX.value = withSpring(1, DISTORTION.spring);
        pressedScale.value = withSpring(1, DISTORTION.spring);
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
