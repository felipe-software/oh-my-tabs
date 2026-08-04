import { StyleSheet, Text, View } from "react-native";

import { ScreenLayout } from "./ScreenLayout";

export function HomeScreen() {
  return (
    <ScreenLayout
      eyebrow="Jelly Tabs"
      title="Início"
      description="Um exemplo mínimo com três páginas e estado local, sem depender de um roteador."
    >
      <View style={styles.row}>
        <Text style={styles.number}>03</Text>
        <Text style={styles.label}>páginas conectadas pela bottom bar</Text>
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
