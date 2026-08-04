import "react-native-gesture-handler";

import { Tabs } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { JellyTabBar } from "../src/JellyTabBar";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f1e8" />
        <Tabs
          screenOptions={{ headerShown: false }}
          tabBar={(props) => <JellyTabBar {...props} />}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="search" />
          <Tabs.Screen name="profile" />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
