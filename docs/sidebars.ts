import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebars: SidebarsConfig = {
    docs: [
        "intro",
        "installation",
        "quick-start",
        {
            type: "category",
            label: "Guides",
            collapsed: false,
            items: [
                "guides/expo-router",
                "guides/react-navigation",
                "guides/headless",
            ],
        },
        {
            type: "category",
            label: "Customization",
            collapsed: false,
            items: [
                "customization/colors",
                "customization/layout",
                "customization/motion",
                "customization/backdrops",
                "customization/touch",
            ],
        },
        {
            type: "category",
            label: "API",
            items: ["api/props"],
        },
    ],
};

export default sidebars;
