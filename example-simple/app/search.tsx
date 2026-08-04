import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { StyleSheet, Text, View } from "react-native";

import { ScreenLayout } from "../src/screens/ScreenLayout";

export default function SearchRoute() {
  return (
    <ScreenLayout
      eyebrow="Page 02"
      title="Search"
      description="Jelly Tabs reads and updates Expo Router's tab state without a manual navigation bridge."
    >
      <View style={styles.searchField}>
        <MaterialIcons color="#625d54" name="search" size={24} />
        <Text style={styles.placeholder}>Search for something</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  searchField: {
    alignItems: "center",
    backgroundColor: "#f5f1e8",
    borderRadius: 18,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 17,
  },
  placeholder: {
    color: "#777166",
    fontSize: 16,
  },
});
