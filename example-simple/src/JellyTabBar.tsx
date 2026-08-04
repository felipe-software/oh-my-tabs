import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { JellyTabs, type TabsIcon, type TabsItem } from "react-native-jelly-tabs";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Derive the tab-bar props from expo-router's Tabs instead of importing them
// from @react-navigation/bottom-tabs, which expo-router vendors internally.
type JellyTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const icon =
  (name: ComponentProps<typeof MaterialIcons>["name"]): TabsIcon =>
  ({ color, size }) =>
    <MaterialIcons color={color} name={name} size={size} />;

// Keys must match the route names declared in app/_layout.tsx.
const TABS: TabsItem[] = [
  { key: "index", label: "Home", activeIcon: icon("home"), inactiveIcon: icon("home") },
  { key: "search", label: "Search", activeIcon: icon("search"), inactiveIcon: icon("search") },
  { key: "profile", label: "Profile", activeIcon: icon("person"), inactiveIcon: icon("person") },
];

export function JellyTabBar({ state, navigation }: JellyTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.bar}>
        <JellyTabs
          items={TABS}
          onTabChange={({ item }) => {
            const route = state.routes.find((r) => r.name === item.key);
            if (route) {
              navigation.navigate(route.name);
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "#f5f1e8",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  bar: {
    height: 64,
    width: "100%",
  },
});
