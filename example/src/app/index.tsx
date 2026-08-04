import { ColorCustomizer } from "@/components/color-customizer";
import { Image } from "expo-image";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@react-native-vector-icons/material-icons/static";
import {
    DEFAULT_TAB_BAR_COLORS,
    TABBAR_LAYOUT,
    Tabs,
    type TabBarColors,
    type TabsItem,
} from "oh-my-tabs";
import { useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RECORDING_MODE =
    process.env.EXPO_PUBLIC_RECORDING_MODE === "1" ||
    process.env.EXPO_PUBLIC_RECORDING_MODE === "true";
const HORIZONTAL_PADDING = 16;

const ITEMS: TabsItem[] = [
    {
        icon: <MaterialIcons name="home" size={TABBAR_LAYOUT.iconSize} />,
        key: "home",
        label: "Home",
    },
    {
        icon: (
            <MaterialIcons
                name="photo-camera"
                size={TABBAR_LAYOUT.iconSize}
            />
        ),
        key: "camera",
        label: "Camera",
    },
    {
        icon: <MaterialIcons name="settings" size={TABBAR_LAYOUT.iconSize} />,
        key: "settings",
        label: "Settings",
    },
    {
        icon: (
            <MaterialIcons
                name="format-paint"
                size={TABBAR_LAYOUT.iconSize}
            />
        ),
        key: "walls",
        label: "Walls",
    },
];

export default function HomeScreen() {
    const { height, width } = useWindowDimensions();
    const [colors, setColors] = useState<TabBarColors>({
        ...DEFAULT_TAB_BAR_COLORS,
    });
    const defaultTrackWidth = Math.max(0, width - HORIZONTAL_PADDING * 2);
    const recordingScale =
        defaultTrackWidth > 0
            ? Math.min(
                  height / defaultTrackWidth,
                  width / TABBAR_LAYOUT.trackHeight,
              )
            : 1;

    return (
        <View style={styles.root}>
            <StatusBar hidden={RECORDING_MODE} style="light" />
            <NavigationBar hidden={RECORDING_MODE} />
            <Image
                contentFit="cover"
                source={require("../../assets/images/color-lab-background.png")}
                style={StyleSheet.absoluteFill}
            />
            <SafeAreaView
                edges={RECORDING_MODE ? [] : ["top", "bottom"]}
                style={[
                    styles.screen,
                    RECORDING_MODE && styles.recordingScreen,
                ]}
            >
                {!RECORDING_MODE && (
                    <ColorCustomizer
                        colors={colors}
                        onColorsChange={setColors}
                    />
                )}

                <View
                    style={[
                        styles.tabsContainer,
                        RECORDING_MODE && {
                            height: TABBAR_LAYOUT.trackHeight * recordingScale,
                            width: defaultTrackWidth * recordingScale,
                            transform: [{ rotate: "90deg" }],
                        },
                    ]}
                >
                    <Tabs
                        colors={colors}
                        displayScale={RECORDING_MODE ? recordingScale : 1}
                        items={ITEMS}
                        recording={RECORDING_MODE}
                    />
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#11100f",
    },
    screen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 12,
    },
    recordingScreen: {
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    tabsContainer: {
        height: TABBAR_LAYOUT.trackHeight,
        marginBottom: 12,
        width: "100%",
    },
});
