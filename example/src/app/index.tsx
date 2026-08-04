import {
    ColorCustomizer,
    type BlurConfig,
} from "@/components/color-customizer";
import { BlurTargetView, BlurView } from "expo-blur";
import { Image, type ImageSource } from "expo-image";
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
    PixelRatio,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    useWindowDimensions,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RECORDING_MODE =
    process.env.EXPO_PUBLIC_RECORDING_MODE === "1" ||
    process.env.EXPO_PUBLIC_RECORDING_MODE === "true";
const IS_WEB = Platform.OS === "web";
const HORIZONTAL_PADDING = 16;
const WEB_TAB_BAR_MAX_WIDTH = 400;
const LOCAL_BACKGROUND = require("../../assets/images/color-lab-background.png");
const randomBackground = (width: number, height: number): ImageSource => ({
    uri: `https://picsum.photos/${width}/${height}?random=${Math.floor(
        Math.random() * 1_000_000,
    )}`,
});
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
    const [background, setBackground] = useState<ImageSource | number>(
        LOCAL_BACKGROUND,
    );
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

    const shuffleBackground = () => {
        const scale = PixelRatio.get();
        setBackground(
            randomBackground(
                Math.round(width * scale),
                Math.round(height * scale),
            ),
        );
    };

    const resetCustomization = () => {
        setBackground(LOCAL_BACKGROUND);
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
                    source={background}
                    style={StyleSheet.absoluteFill}
                    transition={300}
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
                        <View
                            style={[
                                styles.customizerContainer,
                                IS_WEB && { maxHeight: height - 32 },
                            ]}
                        >
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

                {!RECORDING_MODE && (
                    <Pressable
                        accessibilityLabel="Shuffle background image"
                        accessibilityRole="button"
                        onPress={shuffleBackground}
                        style={({ pressed }) => [
                            styles.shuffleButton,
                            pressed && styles.shuffleButtonPressed,
                        ]}
                    >
                        <MaterialIcons color="#FFFFFF" name="shuffle" size={22} />
                    </Pressable>
                )}
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
        ...Platform.select({
            web: {
                justifyContent: "center",
            },
        }),
    },
    customizerContainer: {
        alignItems: "center",
        width: "100%",
        ...Platform.select({
            web: {
                alignItems: "stretch",
                overflow: "auto" as "scroll",
                position: "fixed" as "absolute",
                right: 16,
                top: 16,
                width: 360,
                zIndex: 10,
            },
        }),
    },
    recordingScreen: {
        justifyContent: "center",
        overflow: "hidden",
        paddingHorizontal: 0,
        paddingTop: 0,
    },
    shuffleButton: {
        alignItems: "center",
        backgroundColor: "rgba(15, 23, 42, 0.72)",
        borderColor: "rgba(255, 255, 255, 0.16)",
        borderRadius: 999,
        borderWidth: 1,
        height: 48,
        justifyContent: "center",
        position: "absolute",
        right: 16,
        top: 16,
        width: 48,
        // On web the debug menu is pinned to the top-right, so slide the
        // shuffle control just to the left of it to avoid overlap.
        ...Platform.select({
            web: {
                right: 392,
            },
        }),
    },
    shuffleButtonPressed: {
        opacity: 0.72,
        transform: [{ scale: 0.96 }],
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
