import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { StyleSheet, Text, View } from "react-native";

import { ScreenLayout } from "./ScreenLayout";

export function SearchScreen() {
  return (
    <ScreenLayout
      eyebrow="Página 02"
      title="Buscar"
      description="A troca acontece somente quando a Jelly Tabs confirma uma nova aba em onTabChange."
    >
      <View style={styles.searchField}>
        <MaterialIcons color="#625d54" name="search" size={24} />
        <Text style={styles.placeholder}>Procure alguma coisa</Text>
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
