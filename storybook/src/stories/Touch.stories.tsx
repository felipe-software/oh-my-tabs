import type { Meta, StoryObj } from "@storybook/react";
import { JellyPreview } from "../preview/JellyPreview";

const meta = {
    title: "Customization/Touch",
    component: JellyPreview,
    parameters: { layout: "fullscreen" },
    argTypes: {
        touchFeedbackColor: { control: "color" },
        touchFeedbackEnabled: { control: "boolean" },
    },
} satisfies Meta<typeof JellyPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A soft radial glow follows your finger. Press and hold to see it. */
export const Default: Story = { args: { touchFeedbackEnabled: true } };

/** Tint the glow independently of the pill color. */
export const CustomColor: Story = {
    args: { touchFeedbackEnabled: true, touchFeedbackColor: "#38BDF8" },
};

/** Opt out entirely. */
export const Off: Story = { args: { touchFeedbackEnabled: false } };
