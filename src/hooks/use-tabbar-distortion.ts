import {
    cancelAnimation,
    clamp,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

const TRACK_HEIGHT = 64;
const DISTORTION_THRESHOLD = 800;

// Same pointer-anchored distortion model as oh-my-toast, tuned for the
// subtler horizontal compression of the tabbar.
const RUBBER_BAND_COEFFICIENT = 0.28 / 2;
const VERTICAL_TRANSLATION_FACTOR = 0.25;
const MAX_HORIZONTAL_COMPRESSION = 0.012;

const SPRING = {
    damping: 18,
    mass: 0.9,
    stiffness: 240,
};

const rubberBand = (
    distance: number,
    dimension: number,
    coefficient: number,
): number => {
    "worklet";

    if (distance === 0) {
        return 0;
    }

    const absoluteDistance = Math.abs(distance);
    const dampedDistance =
        (1 -
            1 /
                ((absoluteDistance * coefficient) / dimension + 1)) *
        dimension;

    return Math.sign(distance) * dampedDistance;
};

const getPointerOrigin = (
    currentAbsolutePosition: number,
    dimension: number,
    initialAbsolutePosition: number,
    initialLocalPosition: number,
): number => {
    "worklet";

    const pointerPosition =
        initialLocalPosition +
        (currentAbsolutePosition - initialAbsolutePosition);

    return clamp(pointerPosition, 0, dimension);
};

export const useTabbarDistortion = (displayScale = 1) => {
    const geometryScale = displayScale > 0 ? displayScale : 1;
    const trackHeight = TRACK_HEIGHT * geometryScale;
    const distortionThreshold = DISTORTION_THRESHOLD * geometryScale;

    const trackWidth = useSharedValue(0);
    const translateY = useSharedValue(0);
    const dragOriginY = useSharedValue(0);
    const scaleX = useSharedValue(1);

    const pointerInitialLocalX = useSharedValue(0);
    const pointerInitialAbsoluteX = useSharedValue(0);
    const transformOriginX = useSharedValue(0);

    const begin = (localX: number, absoluteX: number) => {
        "worklet";

        cancelAnimation(translateY);
        cancelAnimation(scaleX);

        dragOriginY.value = translateY.value;
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
                RUBBER_BAND_COEFFICIENT,
            ) * VERTICAL_TRANSLATION_FACTOR;
        const progress = Math.min(
            Math.abs(verticalTranslation) / distortionThreshold,
            1,
        );

        translateY.value = dragOriginY.value + appliedTranslation;
        scaleX.value = 1 - progress * MAX_HORIZONTAL_COMPRESSION;
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

    return {
        begin,
        end,
        setTrackWidth,
        tabbarStyle,
        update,
    };
};
