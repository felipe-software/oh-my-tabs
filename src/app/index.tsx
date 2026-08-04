import { Tabs } from "@/components/tabs";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RECORDING_MODE =
    process.env.EXPO_PUBLIC_RECORDING_MODE === "1" ||
    process.env.EXPO_PUBLIC_RECORDING_MODE === "true";
const HORIZONTAL_PADDING = 16;
const DEFAULT_TRACK_HEIGHT = 64;

export default function HomeScreen() {
    const { height, width } = useWindowDimensions();
    const defaultTrackWidth = Math.max(
        0,
        width - HORIZONTAL_PADDING * 2,
    );
    const recordingScale =
        defaultTrackWidth > 0
            ? Math.min(
                  height / defaultTrackWidth,
                  width / DEFAULT_TRACK_HEIGHT,
              )
            : 1;

    return (
        <>
            <StatusBar hidden={RECORDING_MODE} />
            <NavigationBar hidden={RECORDING_MODE} />
            <SafeAreaView
                edges={RECORDING_MODE ? [] : ["bottom"]}
                style={[
                    styles.screen,
                    RECORDING_MODE && styles.recordingScreen,
                ]}
            >
                <View
                    style={[
                        styles.tabsContainer,
                        RECORDING_MODE && {
                            height:
                                DEFAULT_TRACK_HEIGHT * recordingScale,
                            width: defaultTrackWidth * recordingScale,
                            transform: [{ rotate: "90deg" }],
                        },
                    ]}
                >
                    <Tabs
                        displayScale={RECORDING_MODE ? recordingScale : 1}
                        recording={RECORDING_MODE}
                    />
                </View>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: HORIZONTAL_PADDING,
        alignItems: "center",
    },
    recordingScreen: {
        justifyContent: "center",
        paddingHorizontal: 0,
        overflow: "hidden",
    },
    tabsContainer: {
        width: "100%",
        height: DEFAULT_TRACK_HEIGHT,
    },
});
