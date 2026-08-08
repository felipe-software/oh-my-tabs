import "./preview.css";

/** Global Storybook configuration shared by every story. */
const preview = {
    parameters: {
        layout: "fullscreen",
        controls: { expanded: true, sort: "requiredFirst" },
        options: {
            storySort: {
                order: [
                    "Getting Started",
                    "JellyTabs",
                    "Customization",
                    ["Colors", "Layout", "Motion", "Backdrops", "Touch"],
                ],
            },
        },
    },
};

export default preview;
