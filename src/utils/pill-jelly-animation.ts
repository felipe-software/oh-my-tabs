import {
    advanceSharedSpring,
    getFrameDeltaSeconds,
    getMaxTabIndex,
    type SpringConfig,
} from "./animation";
import type { SharedValue } from "react-native-reanimated";

type SharedNumber = SharedValue<number>;

export interface PillJellyFrameState {
    baseScaleX: SharedNumber;
    baseScaleXRate: SharedNumber;
    baseScaleY: SharedNumber;
    baseScaleYRate: SharedNumber;
    filteredVelocity: SharedNumber;
    filteredVelocityRate: SharedNumber;
    isDragging: SharedNumber;
    pressProgress: SharedNumber;
    pressProgressRate: SharedNumber;
    pressTarget: SharedNumber;
    rawPanelOffset: SharedNumber;
    rawPanelOffsetVelocity: SharedNumber;
    releasePending: SharedNumber;
    shapeTarget: SharedNumber;
    targetValue: SharedNumber;
    value: SharedNumber;
    valueVelocity: SharedNumber;
}

export interface PillJellyFrameConfig {
    releaseDistanceFraction: number;
    springs: {
        panel: SpringConfig;
        press: SpringConfig;
        scaleX: SpringConfig;
        scaleY: SpringConfig;
        value: SpringConfig;
        velocity: SpringConfig;
    };
}

const advancePosition = (
    state: PillJellyFrameState,
    config: PillJellyFrameConfig,
    deltaSeconds: number,
) => {
    "worklet";

    advanceSharedSpring(
        state.value,
        state.valueVelocity,
        state.targetValue.value,
        config.springs.value,
        deltaSeconds,
    );
};

const clampTargetValue = (
    state: PillJellyFrameState,
    tabCount: number,
) => {
    "worklet";

    state.targetValue.value = Math.min(
        Math.max(state.targetValue.value, 0),
        getMaxTabIndex(tabCount),
    );
};

const advanceFilteredVelocity = (
    state: PillJellyFrameState,
    config: PillJellyFrameConfig,
    tabCount: number,
    deltaSeconds: number,
) => {
    "worklet";

    const maxTabIndex = getMaxTabIndex(tabCount);
    const target =
        state.isDragging.value === 1 && maxTabIndex > 0
            ? state.valueVelocity.value / maxTabIndex
            : 0;

    advanceSharedSpring(
        state.filteredVelocity,
        state.filteredVelocityRate,
        target,
        config.springs.velocity,
        deltaSeconds,
    );
};

const advancePanelReturn = (
    state: PillJellyFrameState,
    config: PillJellyFrameConfig,
    deltaSeconds: number,
) => {
    "worklet";

    if (state.isDragging.value === 1) {
        return;
    }

    advanceSharedSpring(
        state.rawPanelOffset,
        state.rawPanelOffsetVelocity,
        0,
        config.springs.panel,
        deltaSeconds,
    );
};

const settleReleasedIndicator = (
    state: PillJellyFrameState,
    config: PillJellyFrameConfig,
    tabCount: number,
) => {
    "worklet";

    if (state.releasePending.value !== 1) {
        return;
    }

    const releaseDistance =
        Math.max(1, getMaxTabIndex(tabCount)) *
        config.releaseDistanceFraction;
    if (
        Math.abs(state.value.value - state.targetValue.value) >=
        releaseDistance
    ) {
        return;
    }

    state.releasePending.value = 0;
    state.pressTarget.value = 0;
    state.shapeTarget.value = 1;
};

const advancePress = (
    state: PillJellyFrameState,
    config: PillJellyFrameConfig,
    deltaSeconds: number,
) => {
    "worklet";

    advanceSharedSpring(
        state.pressProgress,
        state.pressProgressRate,
        state.pressTarget.value,
        config.springs.press,
        deltaSeconds,
    );
};

const advanceShape = (
    state: PillJellyFrameState,
    config: PillJellyFrameConfig,
    deltaSeconds: number,
) => {
    "worklet";

    const target = state.shapeTarget.value;
    advanceSharedSpring(
        state.baseScaleX,
        state.baseScaleXRate,
        target,
        config.springs.scaleX,
        deltaSeconds,
    );
    advanceSharedSpring(
        state.baseScaleY,
        state.baseScaleYRate,
        target,
        config.springs.scaleY,
        deltaSeconds,
    );
};

export const advancePillJellyFrame = (
    state: PillJellyFrameState,
    config: PillJellyFrameConfig,
    tabCount: number,
    timeSincePreviousFrame: number | null,
) => {
    "worklet";

    const deltaSeconds = getFrameDeltaSeconds(timeSincePreviousFrame);
    if (deltaSeconds === null) {
        return;
    }

    clampTargetValue(state, tabCount);
    advancePosition(state, config, deltaSeconds);
    advanceFilteredVelocity(state, config, tabCount, deltaSeconds);
    advancePanelReturn(state, config, deltaSeconds);
    settleReleasedIndicator(state, config, tabCount);
    advancePress(state, config, deltaSeconds);
    advanceShape(state, config, deltaSeconds);
};
