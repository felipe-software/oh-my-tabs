import { DEFAULT_TAB_BAR_COLORS, resolveTabBarConfig } from "../constants";
import type { TabBarColors } from "../constants";
import type {
    JellyNavigationOptions,
    JellyTabBarProps,
    TabsIcon,
    TabsItem,
} from "../types";
import { JellyTabBarHeadless } from "./tabs";
import { useCallback, useMemo, useRef } from "react";
import { type StyleProp, StyleSheet, View, type ViewStyle } from "react-native";

const EmptyIcon: TabsIcon = () => null;

/**
 * React Navigation rebuilds `descriptors` on every navigator render, so any
 * `useMemo` anchored to it is a no-op. Keep the previous reference while the
 * contents are equivalent to provide actual stability.
 */
function useStableArray<T>(
    next: readonly T[],
    isEqual: (a: T, b: T) => boolean,
): readonly T[] {
    const ref = useRef(next);
    const previous = ref.current;

    if (
        previous !== next &&
        (previous.length !== next.length ||
            !next.every((value, index) =>
                isEqual(value, previous[index] as T),
            ))
    ) {
        ref.current = next;
    }

    return ref.current;
}

const resolveLabel = (routeName: string, options: JellyNavigationOptions) => {
    if (options.tabBarShowLabel === false) {
        return "";
    }
    if (typeof options.tabBarLabel === "string") {
        return options.tabBarLabel;
    }
    return options.title ?? routeName;
};

type TabBarIconRenderer = NonNullable<JellyNavigationOptions["tabBarIcon"]>;

const iconWrappers = new WeakMap<
    TabBarIconRenderer,
    { active: TabsIcon; inactive: TabsIcon }
>();

const resolveIcon = (
    options: JellyNavigationOptions,
    focused: boolean,
): TabsIcon => {
    const renderIcon = options.tabBarIcon;
    if (!renderIcon) {
        return EmptyIcon;
    }

    let wrappers = iconWrappers.get(renderIcon);
    if (!wrappers) {
        wrappers = {
            active: ({ color, size }) =>
                renderIcon({ color, focused: true, size }),
            inactive: ({ color, size }) =>
                renderIcon({ color, focused: false, size }),
        };
        iconWrappers.set(renderIcon, wrappers);
    }

    return focused ? wrappers.active : wrappers.inactive;
};

const asColorString = (value: unknown) =>
    typeof value === "string" ? value : undefined;

const areRoutesEqual = <T,>(a: T, b: T) => a === b;

const areItemsEqual = (a: TabsItem, b: TabsItem) =>
    a.key === b.key &&
    a.label === b.label &&
    a.labelStyle === b.labelStyle &&
    a.activeIcon === b.activeIcon &&
    a.inactiveIcon === b.inactiveIcon &&
    a.badge === b.badge &&
    a.badgeStyle === b.badgeStyle &&
    a.accessibilityLabel === b.accessibilityLabel &&
    a.testID === b.testID;

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
    const visibleRoutes = useStableArray(
        state.routes.filter(
            (route) => descriptors[route.key]?.options.href !== null,
        ),
        areRoutesEqual,
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

    const items = useStableArray<TabsItem>(
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
        areItemsEqual,
    );

    const activeTint = asColorString(
        focusedOptions?.tabBarActiveTintColor,
    );
    const inactiveTint = asColorString(
        focusedOptions?.tabBarInactiveTintColor,
    );
    const activeSurface = asColorString(
        focusedOptions?.tabBarActiveBackgroundColor,
    );
    const inactiveSurface = asColorString(
        focusedOptions?.tabBarInactiveBackgroundColor,
    );
    const {
        activeContent: overrideActiveContent,
        inactiveContent: overrideInactiveContent,
        selectedSurface: overrideSelectedSurface,
        surface: overrideSurface,
    } = colors ?? {};

    const navigationColors = useMemo<TabBarColors>(
        () => ({
            activeContent:
                overrideActiveContent ??
                activeTint ??
                DEFAULT_TAB_BAR_COLORS.activeContent,
            inactiveContent:
                overrideInactiveContent ??
                inactiveTint ??
                DEFAULT_TAB_BAR_COLORS.inactiveContent,
            selectedSurface:
                overrideSelectedSurface ??
                activeSurface ??
                DEFAULT_TAB_BAR_COLORS.selectedSurface,
            surface:
                overrideSurface ??
                inactiveSurface ??
                DEFAULT_TAB_BAR_COLORS.surface,
        }),
        [
            activeTint,
            inactiveTint,
            activeSurface,
            inactiveSurface,
            overrideActiveContent,
            overrideInactiveContent,
            overrideSelectedSurface,
            overrideSurface,
        ],
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
