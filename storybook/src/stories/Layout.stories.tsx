import type { Meta, StoryObj } from "@storybook/react";
import { JellyPreview } from "../preview/JellyPreview";

const meta = {
    title: "Customization/Layout",
    component: JellyPreview,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof JellyPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Defaults: 64pt track, 28pt icons, 4pt inset. */
export const Default: Story = {};

/** A shorter, denser bar. */
export const Compact: Story = {
    args: {
        config: { layout: { trackHeight: 52, itemHeight: 44, iconSize: 22 } },
        maxWidth: 340,
    },
};

/** A taller bar with larger glyphs and more breathing room. */
export const Tall: Story = {
    args: {
        config: { layout: { trackHeight: 84, itemHeight: 72, iconSize: 34, trackInset: 8 } },
    },
};

/** Full-width, edge-to-edge track. */
export const FullWidth: Story = { args: { maxWidth: 520 } };
