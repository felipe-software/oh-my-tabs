import type { Meta, StoryObj } from "@storybook/react";
import { JellyPreview } from "../preview/JellyPreview";
import { PALETTES } from "../preview/presets";

const meta = {
    title: "Customization/Colors",
    component: JellyPreview,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof JellyPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default look. `colors` is `TabBarColors` — four tokens. */
export const Amber: Story = { args: { colors: PALETTES.Amber } };
export const Blue: Story = { args: { colors: PALETTES.Blue } };
export const Violet: Story = { args: { colors: PALETTES.Violet } };
export const Emerald: Story = { args: { colors: PALETTES.Emerald } };
export const Cyan: Story = { args: { colors: PALETTES.Cyan } };

/** Light pill on a dark track — high-contrast, no accent hue. */
export const Mono: Story = { args: { colors: PALETTES.Mono } };
