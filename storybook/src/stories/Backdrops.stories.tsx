import type { Meta, StoryObj } from "@storybook/react";
import { JellyPreview } from "../preview/JellyPreview";

const meta = {
    title: "Customization/Backdrops",
    component: JellyPreview,
    parameters: { layout: "fullscreen" },
    argTypes: {
        blurTrack: { control: { type: "range", min: 0, max: 100, step: 1 } },
        blurPill: { control: { type: "range", min: 0, max: 100, step: 1 } },
        showBlur: { control: "boolean" },
    },
} satisfies Meta<typeof JellyPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Frosted glass — `backdrop` and `selectedBackdrop` blur what's behind them. */
export const Blur: Story = { args: { showBlur: true, blurTrack: 35, blurPill: 20 } };

/** Turn the blur way up for a heavier frost. */
export const HeavyBlur: Story = { args: { showBlur: true, blurTrack: 80, blurPill: 60 } };

/** No backdrop node — the solid `surface` color carries the bar. */
export const Solid: Story = { args: { showBlur: false } };
