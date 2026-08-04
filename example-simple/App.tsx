import "react-native-gesture-handler";

import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { JellyTabs, type TabsItem } from "react-native-jelly-tabs";
import { useState } from "react";
import { StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import { HomeScreen } from "./src/screens/HomeScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SearchScreen } from "./src/screens/SearchScreen";

type TabKey = "home" | "search" | "profile";

const tabs: TabsItem[] = [
  {
    key: "home",
    label: "Início",
    activeIcon: ({ color, size }) => (
      <MaterialIcons color={color} name="home" size={size} />
    ),
    inactiveIcon: ({ color, size }) => (
      <MaterialIcons color={color} name="home" size={size} />
    ),
  },
  {
    key: "search",
    label: "Buscar",
    activeIcon: ({ color, size }) => (
      <MaterialIcons color={color} name="search" size={size} />
    ),
    inactiveIcon: ({ color, size }) => (
      <MaterialIcons color={color} name="search" size={size} />
    ),
  },
  {
    key: "profile",
    label: "Perfil",
    activeIcon: ({ color, size }) => (
      <MaterialIcons color={color} name="person" size={size} />
    ),
    inactiveIcon: ({ color, size }) => (
      <MaterialIcons color={color} name="person" size={size} />
    ),
  },
];

function CurrentScreen({ tab }: { tab: TabKey }) {
  switch (tab) {
    case "search":
      return <SearchScreen />;
    case "profile":
      return <ProfileScreen />;
    default:
      return <HomeScreen />;
  }
}

function ExampleApp() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f1e8" />
      <View style={styles.content}>
        <CurrentScreen tab={activeTab} />
      </View>

      <View style={styles.navigation}>
        <View style={styles.tabBar}>
          <JellyTabs
            items={tabs}
            onTabChange={({ item }) => setActiveTab(item.key as TabKey)}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ExampleApp />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    backgroundColor: "#f5f1e8",
    flex: 1,
  },
  content: {
    flex: 1,
  },
  navigation: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tabBar: {
    height: 68,
    width: "100%",
  },
});
