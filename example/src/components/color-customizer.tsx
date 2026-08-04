import { type TabBarColors } from "oh-my-tabs";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type ColorKey = keyof TabBarColors;

const COLOR_OPTIONS = [
    "#11100F",
    "#F2EEE7",
    "#C96F4A",
    "#27483B",
    "#536878",
    "#E5B55F",
    "#813C4D",
    "#B8B4AD",
];

const COLOR_FIELDS: { key: ColorKey; label: string }[] = [
    { key: "surface", label: "Track" },
    { key: "selectedSurface", label: "Pill" },
    { key: "activeContent", label: "Active" },
    { key: "inactiveContent", label: "Inactive" },
];

const PRESETS: { colors: TabBarColors; label: string }[] = [
    {
        label: "Graphite",
        colors: {
            activeContent: "#11100F",
            inactiveContent: "#B8B4AD",
            selectedSurface: "#F2EEE7",
            surface: "#22211F",
        },
    },
    {
        label: "Clay",
        colors: {
            activeContent: "#F8EEE6",
            inactiveContent: "#DAB4A3",
            selectedSurface: "#813C4D",
            surface: "#C96F4A",
        },
    },
    {
        label: "Moss",
        colors: {
            activeContent: "#17241F",
            inactiveContent: "#B7C6BC",
            selectedSurface: "#E5B55F",
            surface: "#27483B",
        },
    },
    {
        label: "Paper",
        colors: {
            activeContent: "#F2EEE7",
            inactiveContent: "#625F59",
            selectedSurface: "#536878",
            surface: "#F2EEE7",
        },
    },
];

interface ColorCustomizerProps {
    colors: TabBarColors;
    onColorsChange: (colors: TabBarColors) => void;
}

interface ColorFieldProps {
    colorKey: ColorKey;
    colors: TabBarColors;
    draft: string;
    label: string;
    onChange: (key: ColorKey, value: string) => void;
    onDraftChange: (key: ColorKey, value: string) => void;
}

const ColorField = ({
    colorKey,
    colors,
    draft,
    label,
    onChange,
    onDraftChange,
}: ColorFieldProps) => (
    <View style={styles.colorField}>
        <View style={styles.colorFieldHeader}>
            <Text style={styles.colorFieldLabel}>{label}</Text>
            <TextInput
                accessibilityLabel={`${label} hexadecimal color`}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={7}
                onBlur={() => onDraftChange(colorKey, colors[colorKey])}
                onChangeText={(value) => onDraftChange(colorKey, value)}
                selectTextOnFocus
                style={styles.hexInput}
                value={draft}
            />
        </View>
        <View style={styles.swatches}>
            {COLOR_OPTIONS.map((color) => {
                const selected =
                    colors[colorKey].toLowerCase() === color.toLowerCase();

                return (
                    <Pressable
                        accessibilityLabel={`Set ${label} to ${color}`}
                        accessibilityRole="button"
                        key={color}
                        onPress={() => onChange(colorKey, color)}
                        style={[
                            styles.swatchButton,
                            selected && styles.swatchButtonSelected,
                        ]}
                    >
                        <View
                            style={[
                                styles.swatch,
                                { backgroundColor: color },
                            ]}
                        />
                    </Pressable>
                );
            })}
        </View>
    </View>
);

export const ColorCustomizer = ({
    colors,
    onColorsChange,
}: ColorCustomizerProps) => {
    const [drafts, setDrafts] = useState<TabBarColors>({ ...colors });

    const updateColor = (key: ColorKey, value: string) => {
        onColorsChange({ ...colors, [key]: value });
        setDrafts((current) => ({ ...current, [key]: value }));
    };

    const updateDraft = (key: ColorKey, value: string) => {
        const normalized = value.startsWith("#") ? value : `#${value}`;
        setDrafts((current) => ({ ...current, [key]: normalized }));

        if (/^#[0-9a-fA-F]{6}$/.test(normalized)) {
            onColorsChange({ ...colors, [key]: normalized });
        }
    };

    const applyPreset = (presetColors: TabBarColors) => {
        onColorsChange({ ...presetColors });
        setDrafts({ ...presetColors });
    };

    return (
        <View style={styles.panel}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.eyebrow}>COLOR LAB</Text>
                    <Text style={styles.title}>Solid surfaces</Text>
                </View>
                <View style={styles.opaqueBadge}>
                    <View style={styles.opaqueDot} />
                    <Text style={styles.opaqueBadgeText}>OPAQUE</Text>
                </View>
            </View>

            <View style={styles.presets}>
                {PRESETS.map((preset) => (
                    <Pressable
                        accessibilityLabel={`Apply ${preset.label} palette`}
                        accessibilityRole="button"
                        key={preset.label}
                        onPress={() => applyPreset(preset.colors)}
                        style={styles.presetButton}
                    >
                        <View style={styles.presetPreview}>
                            <View
                                style={[
                                    styles.presetHalf,
                                    { backgroundColor: preset.colors.surface },
                                ]}
                            />
                            <View
                                style={[
                                    styles.presetHalf,
                                    {
                                        backgroundColor:
                                            preset.colors.selectedSurface,
                                    },
                                ]}
                            />
                        </View>
                        <Text style={styles.presetLabel}>{preset.label}</Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.divider} />

            {COLOR_FIELDS.map((field) => (
                <ColorField
                    colorKey={field.key}
                    colors={colors}
                    draft={drafts[field.key]}
                    key={field.key}
                    label={field.label}
                    onChange={updateColor}
                    onDraftChange={updateDraft}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    panel: {
        width: "100%",
        maxWidth: 480,
        paddingHorizontal: 18,
        paddingBottom: 16,
        paddingTop: 17,
        backgroundColor: "#F2EEE7",
        borderColor: "#D7D0C5",
        borderRadius: 24,
        borderWidth: 1,
        shadowColor: "#000000",
        shadowOffset: { height: 10, width: 0 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
        elevation: 8,
    },
    header: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
    },
    eyebrow: {
        color: "#766F66",
        fontSize: 10,
        fontWeight: "800",
        letterSpacing: 1.8,
    },
    title: {
        color: "#171614",
        fontSize: 24,
        fontWeight: "700",
        letterSpacing: -0.7,
        marginTop: 1,
    },
    opaqueBadge: {
        alignItems: "center",
        backgroundColor: "#E5DED3",
        borderRadius: 999,
        flexDirection: "row",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 7,
    },
    opaqueDot: {
        backgroundColor: "#27483B",
        borderRadius: 999,
        height: 7,
        width: 7,
    },
    opaqueBadgeText: {
        color: "#4D4943",
        fontSize: 9,
        fontWeight: "800",
        letterSpacing: 1.1,
    },
    presets: {
        flexDirection: "row",
        gap: 7,
        marginTop: 14,
    },
    presetButton: {
        alignItems: "center",
        backgroundColor: "#E8E2D9",
        borderRadius: 12,
        flex: 1,
        gap: 5,
        paddingHorizontal: 5,
        paddingVertical: 7,
    },
    presetPreview: {
        borderColor: "#FFFFFF",
        borderRadius: 999,
        borderWidth: 1,
        flexDirection: "row",
        height: 18,
        overflow: "hidden",
        width: 36,
    },
    presetHalf: {
        flex: 1,
    },
    presetLabel: {
        color: "#4D4943",
        fontSize: 10,
        fontWeight: "700",
    },
    divider: {
        backgroundColor: "#D7D0C5",
        height: 1,
        marginBottom: 6,
        marginTop: 13,
    },
    colorField: {
        marginTop: 8,
    },
    colorFieldHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    colorFieldLabel: {
        color: "#4D4943",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.4,
    },
    hexInput: {
        backgroundColor: "#E5DED3",
        borderRadius: 7,
        color: "#26231F",
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: "700",
        height: 25,
        paddingHorizontal: 8,
        paddingVertical: 0,
        textAlign: "center",
        width: 74,
    },
    swatches: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    swatchButton: {
        alignItems: "center",
        borderColor: "transparent",
        borderRadius: 999,
        borderWidth: 2,
        height: 30,
        justifyContent: "center",
        width: 30,
    },
    swatchButtonSelected: {
        borderColor: "#171614",
    },
    swatch: {
        borderColor: "#D0C8BC",
        borderRadius: 999,
        borderWidth: 1,
        height: 22,
        width: 22,
    },
});
