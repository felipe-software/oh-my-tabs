import { JellyPreview } from "./JellyPreview";
import { PALETTES } from "./presets";

// Flat args → one <JellyPreview>. Storybook controls are nicer when flat
// (a color picker per token, a range per number) than a nested object editor.
export interface PlaygroundArgs {
    palette: keyof typeof PALETTES;
    surface: string;
    selectedSurface: string;
    activeContent: string;
    inactiveContent: string;
    showBlur: boolean;
    blurTrack: number;
    blurPill: number;
    trackHeight: number;
    iconSize: number;
    trackInset: number;
    maxWidth: number;
    touchFeedbackEnabled: boolean;
    touchFeedbackColor?: string;
}

export const PLAYGROUND_ARG_TYPES = {
    palette: { control: "select", options: Object.keys(PALETTES) },
    surface: { control: "color" },
    selectedSurface: { control: "color" },
    activeContent: { control: "color" },
    inactiveContent: { control: "color" },
    touchFeedbackColor: { control: "color" },
    showBlur: { control: "boolean" },
    blurTrack: { control: { type: "range", min: 0, max: 100, step: 1 } },
    blurPill: { control: { type: "range", min: 0, max: 100, step: 1 } },
    trackHeight: { control: { type: "range", min: 48, max: 96, step: 1 } },
    iconSize: { control: { type: "range", min: 16, max: 40, step: 1 } },
    trackInset: { control: { type: "range", min: 0, max: 16, step: 1 } },
    maxWidth: { control: { type: "range", min: 260, max: 520, step: 10 } },
    touchFeedbackEnabled: { control: "boolean" },
} as const;

export const PLAYGROUND_DEFAULT_ARGS: PlaygroundArgs = {
    palette: "Amber",
    surface: PALETTES.Amber.surface,
    selectedSurface: PALETTES.Amber.selectedSurface,
    activeContent: PALETTES.Amber.activeContent,
    inactiveContent: PALETTES.Amber.inactiveContent,
    showBlur: true,
    blurTrack: 35,
    blurPill: 20,
    trackHeight: 64,
    iconSize: 28,
    trackInset: 4,
    maxWidth: 400,
    touchFeedbackEnabled: true,
    touchFeedbackColor: undefined,
};

export const Playground = (args: PlaygroundArgs) => (
    <JellyPreview
        colors={{
            surface: args.surface,
            selectedSurface: args.selectedSurface,
            activeContent: args.activeContent,
            inactiveContent: args.inactiveContent,
        }}
        config={{
            layout: {
                trackHeight: args.trackHeight,
                iconSize: args.iconSize,
                trackInset: args.trackInset,
            },
        }}
        showBlur={args.showBlur}
        blurTrack={args.blurTrack}
        blurPill={args.blurPill}
        maxWidth={args.maxWidth}
        touchFeedbackColor={args.touchFeedbackColor}
        touchFeedbackEnabled={args.touchFeedbackEnabled}
    />
);
