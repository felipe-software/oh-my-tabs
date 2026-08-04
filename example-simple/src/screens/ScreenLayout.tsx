import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type ScreenLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ScreenLayout({
  eyebrow,
  title,
  description,
  children,
}: ScreenLayoutProps) {
  return (
    <View style={styles.screen}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 44,
  },
  eyebrow: {
    color: "#777166",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  title: {
    color: "#191713",
    fontSize: 42,
    fontWeight: "700",
    letterSpacing: -1.5,
    marginTop: 10,
  },
  description: {
    color: "#625d54",
    fontSize: 17,
    lineHeight: 25,
    marginTop: 12,
    maxWidth: 360,
  },
  card: {
    backgroundColor: "#e9e2d5",
    borderRadius: 28,
    marginTop: 32,
    padding: 24,
  },
});
