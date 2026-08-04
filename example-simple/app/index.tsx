import { StyleSheet, Text, View } from "react-native";

import { ScreenLayout } from "../src/screens/ScreenLayout";

export default function HomeRoute() {
  return (
    <ScreenLayout
      eyebrow="Jelly Tabs"
      title="Home"
      description="A minimal example with three pages wired to the bar through Expo Router."
    >
      <View style={styles.row}>
        <Text style={styles.number}>03</Text>
        <Text style={styles.label}>pages connected by the bottom bar</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 14,
  },
  number: {
    color: "#191713",
    fontSize: 54,
    fontWeight: "800",
    letterSpacing: -2,
  },
  label: {
    color: "#625d54",
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    paddingBottom: 7,
  },
});
