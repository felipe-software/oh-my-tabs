import type { Meta, StoryObj } from "@storybook/react";
import type { TabsItem } from "react-native-jelly-tabs";
import { DEFAULT_PREVIEW_ITEMS, JellyPreview } from "../preview/JellyPreview";

const withBadges: TabsItem[] = [
    { ...DEFAULT_PREVIEW_ITEMS[0]!, badge: 3 },
    { ...DEFAULT_PREVIEW_ITEMS[1]! },
    { ...DEFAULT_PREVIEW_ITEMS[2]!, badge: "9+" },
    { ...DEFAULT_PREVIEW_ITEMS[3]!, badge: "•" },
];

const meta = {
    title: "JellyTabs/Badges",
    component: JellyPreview,
    parameters: { layout: "fullscreen" },
} satisfies Meta<typeof JellyPreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Each `TabsItem` can carry a numeric or string `badge`. */
export const Badges: Story = { args: { items: withBadges } };
