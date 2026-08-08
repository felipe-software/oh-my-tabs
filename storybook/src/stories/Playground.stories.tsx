import type { Meta, StoryObj } from "@storybook/react";
import {
    Playground,
    PLAYGROUND_ARG_TYPES,
    PLAYGROUND_DEFAULT_ARGS,
} from "../preview/Playground";

const meta = {
    title: "Getting Started/Playground",
    component: Playground,
    parameters: { layout: "fullscreen" },
    argTypes: PLAYGROUND_ARG_TYPES,
    args: PLAYGROUND_DEFAULT_ARGS,
} satisfies Meta<typeof Playground>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Tweak every knob live — colors, blur, layout and touch feedback. */
export const Default: Story = {};
