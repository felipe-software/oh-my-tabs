import { DEFAULT_TAB_BAR_COLORS, resolveTabBarConfig } from "../constants";
import type {
    JellyNavigationOptions,
    JellyTabBarProps,
    TabsIcon,
    TabsItem,
} from "../types";
import { JellyTabBarHeadless } from "./tabs";
import { useCallback, useMemo } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

const EmptyIcon: TabsIcon = () => null;

const resolveLabel = (routeName: string, options: JellyNavigationOptions) => {
    if (options.tabBarShowLabel === false) {
        return "";
    }
    if (typeof options.tabBarLabel === "string") {
        return options.tabBarLabel;
    }
    return options.title ?? routeName;
};

const resolveIcon = (
    options: JellyNavigationOptions,
    focused: boolean,
): TabsIcon => {
    if (!options.tabBarIcon) {
        return EmptyIcon;
    }

    const renderIcon = options.tabBarIcon;
    return ({ color, size }) => renderIcon({ color, focused, size });
};

const asColorString = (value: unknown) =>
    typeof value === "string" ? value : undefined;

export const JellyTabBar = ({
    backdrop,
    colors,
    config,
    containerStyle,
    descriptors,
    displayScale = 1,
    floating = false,
    insets,
    maxWidth = 400,
    navigation,
    state,
    ...headlessProps
}: JellyTabBarProps) => {
    const visibleRoutes = useMemo(
        () =>
            state.routes.filter(
                (route) => descriptors[route.key]?.options.href !== null,
            ),
        [descriptors, state.routes],
    );
    const focusedRoute = state.routes[state.index];
    const selectedIndex = visibleRoutes.findIndex(
        (route) => route.key === focusedRoute?.key,
    );
    const focusedOptions = focusedRoute
        ? descriptors[focusedRoute.key]?.options
        : undefined;
    const resolvedConfig = useMemo(() => resolveTabBarConfig(config), [config]);
    const trackHeight = resolvedConfig.layout.trackHeight * displayScale;

    const items = useMemo<readonly TabsItem[]>(
        () =>
            visibleRoutes.map((route) => {
                const options = descriptors[route.key]?.options ?? {};
                return {
                    accessibilityLabel: options.tabBarAccessibilityLabel,
                    activeIcon: resolveIcon(options, true),
                    badge: options.tabBarBadge,
                    badgeStyle: options.tabBarBadgeStyle,
                    inactiveIcon: resolveIcon(options, false),
                    key: route.key,
                    label: resolveLabel(route.name, options),
                    labelStyle: options.tabBarLabelStyle,
                    testID: options.tabBarButtonTestID,
                };
            }),
        [descriptors, visibleRoutes],
    );

    const navigationColors = useMemo(
        () => ({
            activeContent:
                asColorString(focusedOptions?.tabBarActiveTintColor) ??
                DEFAULT_TAB_BAR_COLORS.activeContent,
            inactiveContent:
                asColorString(focusedOptions?.tabBarInactiveTintColor) ??
                DEFAULT_TAB_BAR_COLORS.inactiveContent,
            selectedSurface:
                asColorString(focusedOptions?.tabBarActiveBackgroundColor) ??
                DEFAULT_TAB_BAR_COLORS.selectedSurface,
            surface:
                asColorString(focusedOptions?.tabBarInactiveBackgroundColor) ??
                DEFAULT_TAB_BAR_COLORS.surface,
            ...colors,
        }),
        [colors, focusedOptions],
    );

    const handleTabPress = useCallback(
        ({ index }: { index: number }) => {
            const route = visibleRoutes[index];
            if (!route) {
                return false;
            }

            const event = navigation.emit({
                canPreventDefault: true,
                target: route.key,
                type: "tabPress",
            }) as { defaultPrevented?: boolean };

            if (event.defaultPrevented) {
                return false;
            }

            if (route.key !== focusedRoute?.key) {
                navigation.dispatch({
                    payload: {
                        name: route.name,
                        params: route.params,
                        path: route.path,
                    },
                    target: state.key,
                    type: "NAVIGATE",
                });
            }

            return true;
        },
        [focusedRoute?.key, navigation, state.key, visibleRoutes],
    );

    const handleTabLongPress = useCallback(
        ({ index }: { index: number }) => {
            const route = visibleRoutes[index];
            if (!route) {
                return;
            }

            navigation.emit({
                target: route.key,
                type: "tabLongPress",
            });
        },
        [navigation, visibleRoutes],
    );

    return (
        <View
            style={[
                styles.container,
                {
                    paddingBottom: insets.bottom + 12,
                    paddingLeft: insets.left + 20,
                    paddingRight: insets.right + 20,
                },
                focusedOptions?.tabBarStyle as StyleProp<ViewStyle>,
                floating && styles.floating,
                containerStyle,
            ]}
        >
            <View style={[styles.bar, { height: trackHeight, maxWidth }]}>
                <JellyTabBarHeadless
                    {...headlessProps}
                    backdrop={backdrop ?? focusedOptions?.tabBarBackground?.()}
                    colors={navigationColors}
                    config={config}
                    displayScale={displayScale}
                    items={items}
                    onTabLongPress={handleTabLongPress}
                    onTabPress={handleTabPress}
                    selectedIndex={selectedIndex}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    bar: {
        alignSelf: "center",
        width: "100%",
    },
    container: {
        paddingTop: 12,
        width: "100%",
    },
    floating: {
        bottom: 0,
        left: 0,
        position: "absolute",
        right: 0,
        zIndex: 1,
    },
});
