import { StyleSheet, Text, View } from "react-native";

import { ScreenLayout } from "../src/screens/ScreenLayout";

export default function ProfileRoute() {
  return (
    <ScreenLayout
      eyebrow="Page 03"
      title="Profile"
      description="The last page shows the simplest possible integration with the bar."
    >
      <View style={styles.avatar}>
        <Text style={styles.initials}>JT</Text>
      </View>
      <Text style={styles.name}>Jelly Tabs</Text>
      <Text style={styles.handle}>@react-native</Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    backgroundColor: "#f05a3c",
    borderRadius: 32,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  initials: {
    color: "#fff8ef",
    fontSize: 20,
    fontWeight: "800",
  },
  name: {
    color: "#191713",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 18,
  },
  handle: {
    color: "#777166",
    fontSize: 15,
    marginTop: 4,
  },
});
