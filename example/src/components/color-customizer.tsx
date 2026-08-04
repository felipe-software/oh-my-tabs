import {
    type DistortionConfig,
    type PillJellyConfig,
    type TabBarColors,
    type TabBarConfig,
    type TabBarLayoutConfig,
    type TabBarOpacity,
} from "react-native-jelly-tabs";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { useState, type ReactNode } from "react";
import {
    Linking,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const GITHUB_URL = "https://github.com/felipe-software/react-native-jelly-tabs";

export interface BlurConfig {
    pill: number;
    track: number;
}

type ColorKey = keyof TabBarColors;
type OpacityKey = keyof TabBarOpacity;
type PanelKey = "palette" | "layout" | "motion" | "touch";
type LayoutNumberKey = keyof TabBarLayoutConfig;
type DistortionSpringKey = keyof DistortionConfig["spring"];
type VerticalDragKey = keyof DistortionConfig["verticalDrag"];
type TouchFeedbackKey = keyof DistortionConfig["touchFeedback"];
type JellySpringKey = keyof PillJellyConfig["frameConfig"]["springs"];
type SpringValueKey = "dampingRatio" | "stiffness";

const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
    { key: "surface", label: "Track" },
    { key: "selectedSurface", label: "Selected pill" },
    { key: "activeContent", label: "Active content" },
    { key: "inactiveContent", label: "Inactive content" },
];

// Each preset is defined by its pill color — the token people actually
// reach for. Surfaces stay a neutral dark so the pill does the talking.
const PALETTES: { colors: TabBarColors; label: string }[] = [
    {
        label: "Blue",
        colors: {
            activeContent: "#EFF6FF",
            inactiveContent: "#A1A1AA",
            selectedSurface: "#2563EB",
            surface: "#18181B",
        },
    },
    {
        label: "Indigo",
        colors: {
            activeContent: "#EEF2FF",
            inactiveContent: "#A5B4FC",
            selectedSurface: "#4F46E5",
            surface: "#1E1B4B",
        },
    },
    {
        label: "Violet",
        colors: {
            activeContent: "#F5F3FF",
            inactiveContent: "#A1A1AA",
            selectedSurface: "#7C3AED",
            surface: "#18181B",
        },
    },
    {
        label: "Pink",
        colors: {
            activeContent: "#FDF2F8",
            inactiveContent: "#A1A1AA",
            selectedSurface: "#EC4899",
            surface: "#18181B",
        },
    },
    {
        label: "Rose",
        colors: {
            activeContent: "#FFF1F2",
            inactiveContent: "#A1A1AA",
            selectedSurface: "#E11D48",
            surface: "#18181B",
        },
    },
    {
        label: "Red",
        colors: {
            activeContent: "#FEF2F2",
            inactiveContent: "#A1A1AA",
            selectedSurface: "#DC2626",
            surface: "#18181B",
        },
    },
    {
        label: "Orange",
        colors: {
            activeContent: "#FFF7ED",
            inactiveContent: "#A8A29E",
            selectedSurface: "#EA580C",
            surface: "#1C1917",
        },
    },
    {
        label: "Amber",
        colors: {
            activeContent: "#451A03",
            inactiveContent: "#A8A29E",
            selectedSurface: "#F59E0B",
            surface: "#1C1917",
        },
    },
    {
        label: "Emerald",
        colors: {
            activeContent: "#ECFDF5",
            inactiveContent: "#A1A1AA",
            selectedSurface: "#10B981",
            surface: "#18181B",
        },
    },
    {
        label: "Teal",
        colors: {
            activeContent: "#F0FDFA",
            inactiveContent: "#94A3B8",
            selectedSurface: "#14B8A6",
            surface: "#0F172A",
        },
    },
    {
        label: "Cyan",
        colors: {
            activeContent: "#ECFEFF",
            inactiveContent: "#94A3B8",
            selectedSurface: "#06B6D4",
            surface: "#0F172A",
        },
    },
    {
        label: "Mono",
        colors: {
            activeContent: "#171717",
            inactiveContent: "#A3A3A3",
            selectedSurface: "#FAFAFA",
            surface: "#171717",
        },
    },
];

// Opacity applied whenever a preset is picked (and used as the default look).
// Values are the previous demo opacities bumped ~30% toward fully opaque.
export const THEME_OPACITY: TabBarOpacity = {
    activeContent: 1,
    inactiveContent: 1,
    selectedSurface: 1,
    surface: 0.78,
};

interface ColorCustomizerProps {
    blur: BlurConfig;
    colors: TabBarColors;
    config: TabBarConfig;
    onBlurChange: (blur: BlurConfig) => void;
    onColorsChange: (colors: TabBarColors) => void;
    onConfigChange: (config: TabBarConfig) => void;
    onOpacityChange: (opacity: TabBarOpacity) => void;
    onReset: () => void;
    onShuffleBackground: () => void;
    onTouchFeedbackColorChange: (color: string) => void;
    opacity: TabBarOpacity;
    touchFeedbackColor: string;
}

interface NumberFieldProps {
    decimals?: number;
    label: string;
    max: number;
    min: number;
    onChange: (value: number) => void;
    step?: number;
    value: number;
}

const formatNumber = (value: number, decimals: number) =>
    decimals === 0
        ? String(Math.round(value))
        : String(Number(value.toFixed(decimals)));

const NumberField = ({
    decimals = 2,
    label,
    max,
    min,
    onChange,
    step = 0.1,
    value,
}: NumberFieldProps) => {
    const normalized = Math.min(Math.max(value, min), max);

    return (
        <View style={styles.numberField}>
            <Text numberOfLines={1} style={styles.sliderLabel}>
                {label}
            </Text>
            <Slider
                accessibilityLabel={label}
                maximumTrackTintColor="#CBD5E1"
                maximumValue={max}
                minimumTrackTintColor="#2563EB"
                minimumValue={min}
                onValueChange={(nextValue) =>
                    onChange(Number(nextValue.toFixed(decimals)))
                }
                step={step}
                style={styles.slider}
                thumbTintColor="#2563EB"
                value={normalized}
            />
            <Text style={styles.sliderValue}>
                {formatNumber(normalized, decimals)}
            </Text>
        </View>
    );
};

interface ColorHexInputProps {
    label: string;
    onChange: (value: string) => void;
    value: string;
}

const ColorHexInputField = ({ label, onChange, value }: ColorHexInputProps) => {
    const [draft, setDraft] = useState(value);

    const updateDraft = (draft: string) => {
        const normalized = draft.startsWith("#") ? draft : `#${draft}`;
        setDraft(normalized);
        if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
            onChange(normalized);
        }
    };

    return (
        <TextInput
            accessibilityLabel={`${label} hexadecimal color`}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={7}
            onBlur={() => {
                if (!/^#[0-9a-fA-F]{6}$/.test(draft)) {
                    setDraft(value);
                }
            }}
            onChangeText={updateDraft}
            selectTextOnFocus
            style={styles.hexInput}
            value={draft}
        />
    );
};

const ColorHexInput = (props: ColorHexInputProps) => (
    <ColorHexInputField key={`${props.label}:${props.value}`} {...props} />
);

const ToggleField = ({
    label,
    onChange,
    value,
}: {
    label: string;
    onChange: (value: boolean) => void;
    value: boolean;
}) => (
    <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        onPress={() => onChange(!value)}
        style={({ pressed }) => [styles.toggleRow, pressed && styles.pressed]}
    >
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={[styles.toggleTrack, value && styles.toggleTrackActive]}>
            <View
                style={[styles.toggleThumb, value && styles.toggleThumbActive]}
            />
        </View>
    </Pressable>
);

const Section = ({
    children,
    title,
}: {
    children: ReactNode;
    title: string;
}) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const AccordionSection = ({
    children,
    expanded,
    onPress,
    title,
}: {
    children: ReactNode;
    expanded: boolean;
    onPress: () => void;
    title: string;
}) => (
    <View style={styles.accordionSection}>
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            onPress={onPress}
            style={({ pressed }) => [
                styles.accordionHeader,
                expanded && styles.accordionHeaderOpen,
                pressed && styles.pressed,
            ]}
        >
            <Text
                style={[
                    styles.accordionTitle,
                    expanded && styles.accordionTitleOpen,
                ]}
            >
                {title}
            </Text>
            <MaterialIcons
                color={expanded ? "#0F172A" : "#64748B"}
                name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={22}
            />
        </Pressable>
        {expanded && (
            <View style={styles.accordionContent}>{children}</View>
        )}
    </View>
);

export const ColorCustomizer = ({
    blur,
    colors,
    config,
    onBlurChange,
    onColorsChange,
    onConfigChange,
    onOpacityChange,
    onReset,
    onShuffleBackground,
    onTouchFeedbackColorChange,
    opacity,
    touchFeedbackColor,
}: ColorCustomizerProps) => {
    const [activePanel, setActivePanel] = useState<PanelKey | null>(null);

    const togglePanel = (panel: PanelKey) =>
        setActivePanel((current) => (current === panel ? null : panel));

    const updateLayout = (key: LayoutNumberKey, value: number) => {
        onConfigChange({
            ...config,
            layout: { ...config.layout, [key]: value },
        });
    };

    const updateJellySpring = (
        spring: JellySpringKey,
        key: SpringValueKey,
        value: number,
    ) => {
        onConfigChange({
            ...config,
            pillJelly: {
                ...config.pillJelly,
                frameConfig: {
                    ...config.pillJelly.frameConfig,
                    springs: {
                        ...config.pillJelly.frameConfig.springs,
                        [spring]: {
                            ...config.pillJelly.frameConfig.springs[spring],
                            [key]: value,
                        },
                    },
                },
            },
        });
    };

    const updateDistortionSpring = (
        key: DistortionSpringKey,
        value: number,
    ) => {
        onConfigChange({
            ...config,
            distortion: {
                ...config.distortion,
                spring: { ...config.distortion.spring, [key]: value },
            },
        });
    };

    const updateVerticalDrag = (key: VerticalDragKey, value: number) => {
        onConfigChange({
            ...config,
            distortion: {
                ...config.distortion,
                verticalDrag: {
                    ...config.distortion.verticalDrag,
                    [key]: value,
                },
            },
        });
    };

    const updateTouchFeedback = (key: TouchFeedbackKey, value: number) => {
        onConfigChange({
            ...config,
            distortion: {
                ...config.distortion,
                touchFeedback: {
                    ...config.distortion.touchFeedback,
                    [key]: value,
                },
            },
        });
    };

    return (
        <View style={styles.panel}>
            <View style={styles.header}>
                <Text style={styles.title}>react-native-jelly-tabs</Text>
                <View style={styles.headerActions}>
                    <Pressable
                        accessibilityLabel="Change background image"
                        accessibilityRole="button"
                        onPress={onShuffleBackground}
                        style={({ pressed }) => [
                            styles.githubButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <MaterialIcons color="#F8FAFC" name="image" size={16} />
                        <Text style={styles.githubButtonText}>Change bg</Text>
                    </Pressable>
                    <Pressable
                        accessibilityLabel="Open react-native-jelly-tabs on GitHub"
                        accessibilityRole="link"
                        onPress={() => Linking.openURL(GITHUB_URL)}
                        style={({ pressed }) => [
                            styles.githubButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <MaterialIcons color="#F8FAFC" name="code" size={16} />
                        <Text style={styles.githubButtonText}>GitHub</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        onPress={onReset}
                        style={({ pressed }) => [
                            styles.resetButton,
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </Pressable>
                </View>
            </View>

            <View style={styles.accordion}>
                <AccordionSection
                    expanded={activePanel === "palette"}
                    onPress={() => togglePanel("palette")}
                    title="Palette"
                >
                    <View style={styles.paletteGrid}>
                        {PALETTES.map((palette) => {
                            const selected = Object.keys(colors).every(
                                (key) =>
                                    colors[key as ColorKey].toLowerCase() ===
                                    palette.colors[key as ColorKey].toLowerCase(),
                            );
                            return (
                                <Pressable
                                    accessibilityLabel={`Apply ${palette.label} palette`}
                                    accessibilityRole="button"
                                    key={palette.label}
                                    onPress={() => {
                                        onColorsChange({ ...palette.colors });
                                        onOpacityChange({ ...THEME_OPACITY });
                                        onTouchFeedbackColorChange(
                                            palette.colors.selectedSurface,
                                        );
                                    }}
                                    style={({ pressed }) => [
                                        styles.paletteButton,
                                        {
                                            backgroundColor:
                                                palette.colors.selectedSurface,
                                        },
                                        selected && styles.paletteButtonActive,
                                        pressed && styles.pressed,
                                    ]}
                                />
                            );
                        })}
                    </View>

                    <Section title="Color and opacity">
                        {COLOR_FIELDS.map((field) => (
                            <View key={field.key} style={styles.colorRow}>
                                <View
                                    style={[
                                        styles.colorPreview,
                                        { backgroundColor: "#D4D4D8" },
                                    ]}
                                >
                                    <View
                                        style={[
                                            StyleSheet.absoluteFill,
                                            {
                                                backgroundColor:
                                                    colors[field.key],
                                                opacity: opacity[field.key],
                                            },
                                        ]}
                                    />
                                </View>
                                <View style={styles.colorNameColumn}>
                                    <Text style={styles.fieldLabel}>
                                        {field.label}
                                    </Text>
                                    <ColorHexInput
                                        label={field.label}
                                        onChange={(value) =>
                                            onColorsChange({
                                                ...colors,
                                                [field.key]: value,
                                            })
                                        }
                                        value={colors[field.key]}
                                    />
                                </View>
                                <View style={styles.opacityField}>
                                    <NumberField
                                        label="Opacity"
                                        max={1}
                                        min={0}
                                        onChange={(value) =>
                                            onOpacityChange({
                                                ...opacity,
                                                [field.key as OpacityKey]:
                                                    value,
                                            })
                                        }
                                        step={0.05}
                                        value={opacity[field.key]}
                                    />
                                </View>
                            </View>
                        ))}
                    </Section>

                    <Section title="Touch feedback">
                        <View style={styles.colorRow}>
                            <View
                                style={[
                                    styles.colorPreview,
                                    { backgroundColor: "#D4D4D8" },
                                ]}
                            >
                                <View
                                    style={[
                                        StyleSheet.absoluteFill,
                                        {
                                            backgroundColor: touchFeedbackColor,
                                            opacity:
                                                config.distortion.touchFeedback
                                                    .opacity,
                                        },
                                    ]}
                                />
                            </View>
                            <View style={styles.colorNameColumn}>
                                <Text style={styles.fieldLabel}>Color</Text>
                                <ColorHexInput
                                    label="Touch feedback"
                                    onChange={onTouchFeedbackColorChange}
                                    value={touchFeedbackColor}
                                />
                            </View>
                        </View>
                        <View style={styles.twoColumnGrid}>
                            {(
                                Object.keys(
                                    config.distortion.touchFeedback,
                                ) as TouchFeedbackKey[]
                            ).map((key) => (
                                <NumberField
                                    decimals={key === "radius" ? 0 : 2}
                                    key={key}
                                    label={
                                        key === "middleOpacityRatio"
                                            ? "Middle opacity ratio"
                                            : `${key[0].toUpperCase()}${key.slice(1)}`
                                    }
                                    max={
                                        key === "radius"
                                            ? 400
                                            : key === "scale"
                                              ? 5
                                              : 1
                                    }
                                    min={0}
                                    onChange={(value) =>
                                        updateTouchFeedback(key, value)
                                    }
                                    step={key === "radius" ? 5 : 0.05}
                                    value={config.distortion.touchFeedback[key]}
                                />
                            ))}
                        </View>
                    </Section>

                    <Section title="Backdrop blur">
                        <View style={styles.twoColumnGrid}>
                            <NumberField
                                decimals={0}
                                label="Track intensity"
                                max={100}
                                min={0}
                                onChange={(track) =>
                                    onBlurChange({ ...blur, track })
                                }
                                step={5}
                                value={blur.track}
                            />
                            <NumberField
                                decimals={0}
                                label="Pill intensity"
                                max={100}
                                min={0}
                                onChange={(pill) =>
                                    onBlurChange({ ...blur, pill })
                                }
                                step={5}
                                value={blur.pill}
                            />
                        </View>
                    </Section>
                </AccordionSection>

                <AccordionSection
                    expanded={activePanel === "layout"}
                    onPress={() => togglePanel("layout")}
                    title="Layout"
                >
                    <Section title="Geometry">
                        <View style={styles.twoColumnGrid}>
                            <NumberField
                                decimals={0}
                                label="Icon size"
                                max={64}
                                min={8}
                                onChange={(value) =>
                                    updateLayout("iconSize", value)
                                }
                                step={1}
                                value={config.layout.iconSize}
                            />
                            <NumberField
                                decimals={0}
                                label="Item height"
                                max={120}
                                min={24}
                                onChange={(value) =>
                                    updateLayout("itemHeight", value)
                                }
                                step={1}
                                value={config.layout.itemHeight}
                            />
                            <NumberField
                                decimals={0}
                                label="Track height"
                                max={128}
                                min={32}
                                onChange={(value) =>
                                    updateLayout("trackHeight", value)
                                }
                                step={1}
                                value={config.layout.trackHeight}
                            />
                            <NumberField
                                decimals={0}
                                label="Track inset"
                                max={32}
                                min={0}
                                onChange={(value) =>
                                    updateLayout("trackInset", value)
                                }
                                step={1}
                                value={config.layout.trackInset}
                            />
                            <NumberField
                                decimals={0}
                                label="Mask overscan X"
                                max={160}
                                min={0}
                                onChange={(value) =>
                                    updateLayout("maskOverscanX", value)
                                }
                                step={1}
                                value={config.layout.maskOverscanX}
                            />
                            <NumberField
                                decimals={0}
                                label="Mask overscan Y"
                                max={80}
                                min={0}
                                onChange={(value) =>
                                    updateLayout("maskOverscanY", value)
                                }
                                step={1}
                                value={config.layout.maskOverscanY}
                            />
                        </View>
                    </Section>
                </AccordionSection>

                <AccordionSection
                    expanded={activePanel === "motion"}
                    onPress={() => togglePanel("motion")}
                    title="Motion"
                >
                    <Section title="Jelly behavior">
                        <ToggleField
                            label="Snap on pointer down"
                            onChange={(snapOnPointerDown) =>
                                onConfigChange({
                                    ...config,
                                    pillJelly: {
                                        ...config.pillJelly,
                                        snapOnPointerDown,
                                    },
                                })
                            }
                            value={config.pillJelly.snapOnPointerDown}
                        />
                        <View style={styles.twoColumnGrid}>
                            <NumberField
                                label="Pressed scale"
                                max={2}
                                min={0.5}
                                onChange={(pressedScale) =>
                                    onConfigChange({
                                        ...config,
                                        pillJelly: {
                                            ...config.pillJelly,
                                            pressedScale,
                                        },
                                    })
                                }
                                step={0.05}
                                value={config.pillJelly.pressedScale}
                            />
                            <NumberField
                                decimals={3}
                                label="Release distance"
                                max={1}
                                min={0}
                                onChange={(releaseDistanceFraction) =>
                                    onConfigChange({
                                        ...config,
                                        pillJelly: {
                                            ...config.pillJelly,
                                            frameConfig: {
                                                ...config.pillJelly.frameConfig,
                                                releaseDistanceFraction,
                                            },
                                        },
                                    })
                                }
                                step={0.005}
                                value={
                                    config.pillJelly.frameConfig
                                        .releaseDistanceFraction
                                }
                            />
                        </View>
                    </Section>

                    {(
                        Object.keys(
                            config.pillJelly.frameConfig.springs,
                        ) as JellySpringKey[]
                    ).map((spring) => (
                        <Section
                            key={spring}
                            title={`${spring[0].toUpperCase()}${spring.slice(1)} spring`}
                        >
                            <View style={styles.twoColumnGrid}>
                                <NumberField
                                    decimals={0}
                                    label="Stiffness"
                                    max={3000}
                                    min={1}
                                    onChange={(value) =>
                                        updateJellySpring(
                                            spring,
                                            "stiffness",
                                            value,
                                        )
                                    }
                                    step={10}
                                    value={
                                        config.pillJelly.frameConfig.springs[
                                            spring
                                        ].stiffness
                                    }
                                />
                                <NumberField
                                    label="Damping ratio"
                                    max={2}
                                    min={0.05}
                                    onChange={(value) =>
                                        updateJellySpring(
                                            spring,
                                            "dampingRatio",
                                            value,
                                        )
                                    }
                                    step={0.05}
                                    value={
                                        config.pillJelly.frameConfig.springs[
                                            spring
                                        ].dampingRatio
                                    }
                                />
                            </View>
                        </Section>
                    ))}
                </AccordionSection>

                <AccordionSection
                    expanded={activePanel === "touch"}
                    onPress={() => togglePanel("touch")}
                    title="Touch"
                >
                    <Section title="Press transform">
                        <View style={styles.twoColumnGrid}>
                            <NumberField
                                label="Pressed scale"
                                max={1.5}
                                min={0.5}
                                onChange={(pressedScale) =>
                                    onConfigChange({
                                        ...config,
                                        distortion: {
                                            ...config.distortion,
                                            pressedScale,
                                        },
                                    })
                                }
                                step={0.025}
                                value={config.distortion.pressedScale}
                            />
                        </View>
                    </Section>

                    <Section title="Distortion spring">
                        <View style={styles.twoColumnGrid}>
                            {(
                                Object.keys(
                                    config.distortion.spring,
                                ) as DistortionSpringKey[]
                            ).map((key) => (
                                <NumberField
                                    decimals={key === "mass" ? 2 : 0}
                                    key={key}
                                    label={`${key[0].toUpperCase()}${key.slice(1)}`}
                                    max={key === "mass" ? 10 : 2000}
                                    min={key === "mass" ? 0.05 : 1}
                                    onChange={(value) =>
                                        updateDistortionSpring(key, value)
                                    }
                                    step={key === "mass" ? 0.1 : 5}
                                    value={config.distortion.spring[key]}
                                />
                            ))}
                        </View>
                    </Section>

                    <Section title="Vertical drag">
                        <View style={styles.twoColumnGrid}>
                            {(
                                Object.keys(
                                    config.distortion.verticalDrag,
                                ) as VerticalDragKey[]
                            ).map((key) => (
                                <NumberField
                                    decimals={
                                        key === "distanceForMaxDistortion"
                                            ? 0
                                            : 2
                                    }
                                    key={key}
                                    label={
                                        key === "distanceForMaxDistortion"
                                            ? "Max distortion distance"
                                            : key === "rubberBand"
                                              ? "Rubber band"
                                              : `${key[0].toUpperCase()}${key.slice(1)}`
                                    }
                                    max={
                                        key === "distanceForMaxDistortion"
                                            ? 2000
                                            : 1
                                    }
                                    min={0}
                                    onChange={(value) =>
                                        updateVerticalDrag(key, value)
                                    }
                                    step={
                                        key === "distanceForMaxDistortion"
                                            ? 25
                                            : 0.05
                                    }
                                    value={config.distortion.verticalDrag[key]}
                                />
                            ))}
                        </View>
                    </Section>
                </AccordionSection>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        backgroundColor: "#F8FAFC",
        borderColor: "#CBD5E1",
        borderRadius: 18,
        borderWidth: 1,
        maxWidth: 520,
        overflow: "hidden",
        shadowColor: "#0F172A",
        shadowOffset: { height: 12, width: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
        userSelect: "none",
        width: "100%",
        elevation: 8,
    },
    header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingBottom: 8,
        paddingTop: 10,
    },
    title: {
        color: "#0F172A",
        flexShrink: 0,
        fontFamily: "monospace",
        fontSize: 17,
        fontWeight: "700",
        letterSpacing: -0.5,
    },
    headerActions: {
        alignItems: "center",
        flexDirection: "row",
        flexShrink: 1,
        flexWrap: "wrap",
        gap: 6,
        justifyContent: "flex-end",
    },
    githubButton: {
        alignItems: "center",
        backgroundColor: "#0F172A",
        borderRadius: 8,
        flexDirection: "row",
        gap: 5,
        paddingHorizontal: 9,
        paddingVertical: 7,
    },
    githubButtonText: {
        color: "#F8FAFC",
        fontSize: 12,
        fontWeight: "700",
    },
    resetButton: {
        backgroundColor: "#E2E8F0",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    resetButtonText: {
        color: "#334155",
        fontSize: 12,
        fontWeight: "700",
    },
    pressed: {
        opacity: 0.72,
        transform: [{ scale: 0.98 }],
    },
    accordion: {
        borderTopColor: "#E2E8F0",
        borderTopWidth: 1,
    },
    accordionSection: {
        borderBottomColor: "#E2E8F0",
        borderBottomWidth: 1,
    },
    accordionHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    accordionHeaderOpen: {
        backgroundColor: "#FFFFFF",
    },
    accordionTitle: {
        color: "#64748B",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 0.2,
    },
    accordionTitleOpen: {
        color: "#0F172A",
    },
    accordionContent: {
        backgroundColor: "#FFFFFF",
        paddingBottom: 6,
        paddingHorizontal: 16,
        paddingTop: 2,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        color: "#334155",
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
    },
    paletteGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginBottom: 10,
    },
    paletteButton: {
        borderColor: "transparent",
        borderRadius: 8,
        borderWidth: 2,
        height: 30,
        width: "18%",
    },
    paletteButtonActive: {
        borderColor: "#0F172A",
    },
    colorRow: {
        alignItems: "center",
        borderBottomColor: "#E2E8F0",
        borderBottomWidth: 1,
        flexDirection: "row",
        gap: 10,
        paddingVertical: 6,
    },
    colorPreview: {
        borderColor: "#CBD5E1",
        borderRadius: 8,
        borderWidth: 1,
        height: 34,
        overflow: "hidden",
        width: 34,
    },
    colorNameColumn: {
        flex: 1,
        gap: 4,
    },
    fieldLabel: {
        color: "#475569",
        fontSize: 11,
        fontWeight: "600",
    },
    hexInput: {
        color: "#0F172A",
        fontFamily: "monospace",
        fontSize: 11,
        fontWeight: "600",
        height: 22,
        padding: 0,
    },
    opacityField: {
        flex: 1.3,
    },
    twoColumnGrid: {
        gap: 6,
    },
    numberField: {
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        borderRadius: 9,
        flexDirection: "row",
        gap: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    sliderLabel: {
        color: "#475569",
        flexShrink: 1,
        fontSize: 11,
        fontWeight: "600",
        minWidth: 0,
    },
    sliderValue: {
        color: "#0F172A",
        fontFamily: "monospace",
        fontSize: 11,
        fontWeight: "700",
        minWidth: 30,
        textAlign: "right",
    },
    slider: {
        flex: 1,
        height: 24,
        minWidth: 60,
    },
    toggleRow: {
        alignItems: "center",
        backgroundColor: "#F1F5F9",
        borderRadius: 9,
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    toggleTrack: {
        backgroundColor: "#CBD5E1",
        borderRadius: 999,
        height: 22,
        justifyContent: "center",
        padding: 2,
        width: 38,
    },
    toggleTrackActive: {
        backgroundColor: "#2563EB",
    },
    toggleThumb: {
        backgroundColor: "#FFFFFF",
        borderRadius: 999,
        height: 18,
        width: 18,
    },
    toggleThumbActive: {
        alignSelf: "flex-end",
    },
});
