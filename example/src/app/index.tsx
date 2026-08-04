import {
    ColorCustomizer,
    type BlurConfig,
} from "@/components/color-customizer";
import { BlurTargetView, BlurView } from "expo-blur";
import { Image } from "expo-image";
import { NavigationBar } from "expo-navigation-bar";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import {
    DEFAULT_TAB_BAR_COLORS,
    DEFAULT_TAB_BAR_OPACITY,
    TABBAR_LAYOUT,
    Tabs,
    resolveTabBarConfig,
    type TabBarConfig,
    type TabBarColors,
    type TabBarOpacity,
    type TabsItem,
} from "oh-my-tabs";
import { useRef, useState } from "react";
import {
    Platform,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RECORDING_MODE =
    process.env.EXPO_PUBLIC_RECORDING_MODE === "1" ||
    process.env.EXPO_PUBLIC_RECORDING_MODE === "true";
const HORIZONTAL_PADDING = 16;
const WEB_TAB_BAR_MAX_WIDTH = 400;
const INITIAL_BLUR: BlurConfig = { pill: 20, track: 35 };
const INITIAL_TOUCH_FEEDBACK_COLOR = DEFAULT_TAB_BAR_COLORS.selectedSurface;
const INITIAL_OPACITY: TabBarOpacity = {
    ...DEFAULT_TAB_BAR_OPACITY,
    inactiveContent: 0.82,
    selectedSurface: 0.86,
    surface: 0.78,
};

const ITEMS: TabsItem[] = [
    {
        icon: <MaterialIcons name="home" size={TABBAR_LAYOUT.iconSize} />,
        key: "home",
        label: "Home",
    },
    {
        icon: (
            <MaterialIcons name="photo-camera" size={TABBAR_LAYOUT.iconSize} />
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
            <MaterialIcons name="format-paint" size={TABBAR_LAYOUT.iconSize} />
        ),
        key: "walls",
        label: "Walls",
    },
];

export default function HomeScreen() {
    const { height, width } = useWindowDimensions();
    const blurTargetRef = useRef<View>(null);
    const [blur, setBlur] = useState<BlurConfig>({ ...INITIAL_BLUR });
    const [colors, setColors] = useState<TabBarColors>({
        ...DEFAULT_TAB_BAR_COLORS,
    });
    const [config, setConfig] = useState<TabBarConfig>(() =>
        resolveTabBarConfig(),
    );
    const [opacity, setOpacity] = useState<TabBarOpacity>({
        ...INITIAL_OPACITY,
    });
    const [touchFeedbackColor, setTouchFeedbackColor] = useState(
        INITIAL_TOUCH_FEEDBACK_COLOR,
    );
    const defaultTrackWidth = Math.max(0, width - HORIZONTAL_PADDING * 2);
    const recordingScale =
        defaultTrackWidth > 0
            ? Math.min(
                  height / defaultTrackWidth,
                  width / config.layout.trackHeight,
              )
            : 1;

    const resetCustomization = () => {
        setBlur({ ...INITIAL_BLUR });
        setColors({ ...DEFAULT_TAB_BAR_COLORS });
        setConfig(resolveTabBarConfig());
        setOpacity({ ...INITIAL_OPACITY });
        setTouchFeedbackColor(INITIAL_TOUCH_FEEDBACK_COLOR);
    };

    return (
        <View style={styles.root}>
            <StatusBar hidden={RECORDING_MODE} style="light" />
            <NavigationBar hidden={RECORDING_MODE} />
            <BlurTargetView ref={blurTargetRef} style={StyleSheet.absoluteFill}>
                <Image
                    contentFit="cover"
                    source={require("../../assets/images/color-lab-background.png")}
                    style={StyleSheet.absoluteFill}
                />
            </BlurTargetView>
            <SafeAreaView
                edges={RECORDING_MODE ? [] : ["top", "bottom"]}
                style={styles.safeArea}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.screen,
                        RECORDING_MODE && styles.recordingScreen,
                    ]}
                    keyboardShouldPersistTaps="handled"
                    scrollEnabled={!RECORDING_MODE}
                    showsVerticalScrollIndicator={false}
                >
                    {!RECORDING_MODE && (
                        <View style={styles.customizerContainer}>
                            <ColorCustomizer
                                blur={blur}
                                colors={colors}
                                config={config}
                                onBlurChange={setBlur}
                                onColorsChange={setColors}
                                onConfigChange={setConfig}
                                onOpacityChange={setOpacity}
                                onReset={resetCustomization}
                                onTouchFeedbackColorChange={
                                    setTouchFeedbackColor
                                }
                                opacity={opacity}
                                touchFeedbackColor={touchFeedbackColor}
                            />
                        </View>
                    )}

                    <View
                        style={[
                            styles.tabsContainer,
                            { height: config.layout.trackHeight },
                            RECORDING_MODE && {
                                height:
                                    config.layout.trackHeight * recordingScale,
                                width: defaultTrackWidth * recordingScale,
                                transform: [{ rotate: "90deg" }],
                            },
                        ]}
                    >
                        <Tabs
                            backdrop={
                                <BlurView
                                    blurMethod="dimezisBlurViewSdk31Plus"
                                    blurTarget={blurTargetRef}
                                    intensity={blur.track}
                                    style={StyleSheet.absoluteFill}
                                    tint="dark"
                                />
                            }
                            colors={colors}
                            config={config}
                            displayScale={RECORDING_MODE ? recordingScale : 1}
                            items={ITEMS}
                            opacity={opacity}
                            recording={RECORDING_MODE}
                            selectedBackdrop={
                                <BlurView
                                    blurMethod="dimezisBlurViewSdk31Plus"
                                    blurTarget={blurTargetRef}
                                    intensity={blur.pill}
                                    style={StyleSheet.absoluteFill}
                                    tint="default"
                                />
                            }
                            touchFeedbackColor={touchFeedbackColor}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#11100f",
    },
    safeArea: {
        flex: 1,
    },
    screen: {
        alignItems: "center",
        flexGrow: 1,
        gap: 16,
        justifyContent: "space-between",
        paddingBottom: 12,
        paddingHorizontal: HORIZONTAL_PADDING,
        paddingTop: 12,
    },
    customizerContainer: {
        alignItems: "center",
        width: "100%",
    },
    recordingScreen: {
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    tabsContainer: {
        width: "100%",
        ...Platform.select({
            web: {
                alignSelf: "center",
                maxWidth: WEB_TAB_BAR_MAX_WIDTH,
            },
        }),
    },
});
