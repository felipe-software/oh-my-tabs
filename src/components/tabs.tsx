import { TabItem } from "@/components/tab-item";
import { usePillJelly } from "@/hooks/use-pill-jelly";
import MaskedView from "@react-native-masked-view/masked-view";
import { CameraIcon, GearSixIcon, HouseIcon } from "phosphor-react-native";
import { cloneElement } from "react";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
const PILL_WIDTH = 96;
export const Tabs = () => {
    const { currentIndex, gesture, pillStyle, setTrackWidth, updateTabSize } =
        usePillJelly();

    console.log({ currentIndex });

    const tabs = [
        <TabItem
            icon={
                <HouseIcon
                    style={{
                        transform: [{ scale: 1.5 }],
                    }}
                    size={16}
                    weight="duotone"
                />
            }
            text="Home"
        />,
        <TabItem
            icon={
                <CameraIcon
                    style={{
                        transform: [{ scale: 1.5 }],
                    }}
                    size={16}
                    weight="duotone"
                />
            }
            text="Camera"
        />,
        <TabItem
            icon={
                <GearSixIcon
                    style={{
                        transform: [{ scale: 1.5 }],
                    }}
                    size={16}
                    weight="duotone"
                />
            }
            text="Settings"
        />,
    ];

    return (
        <GestureDetector gesture={gesture}>
            <View
                style={[styles.track, { padding: 0 }]}
                onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
            >
                <Animated.View
                    style={[styles.pill, pillStyle, { zIndex: 2 }]}
                />
                <MaskedView
                    maskElement={
                        <Animated.View style={[styles.pill, pillStyle]} />
                    }
                    style={[
                        styles.track,
                        StyleSheet.absoluteFill,
                        {
                            backgroundColor: "#c0c0c0",
                            zIndex: 10,
                            borderRadius: 999,
                        },
                    ]}
                >
                    {tabs.map((icon) =>
                        cloneElement(icon as any, { isActive: true }),
                    )}
                </MaskedView>

                {tabs.map((icon, index) =>
                    cloneElement<any>(icon as any, {
                        onMeasure: (size: any) => {
                            updateTabSize(index, size);
                        },
                    }),
                )}
            </View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    track: {
        position: "relative",
        // width: "fit-content",
        height: 64,
        backgroundColor: "#1f1f1f",
        alignItems: "center",
        padding: 0,
        borderRadius: 32,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "auto",
        flexGrow: 0,
    },
    pill: {
        position: "absolute",
        width: PILL_WIDTH,
        left: 0,
        height: "100%",
        backgroundColor: "#c0c0c0",
        borderRadius: 999,
        zIndex: 0,
    },
});
