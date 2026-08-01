import { Tabs } from "@/components/tabs";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function HomeScreen() {
    return (
        <SafeAreaView edges={["bottom"]} style={styles.screen}>
            <Tabs />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: "flex-end",
        paddingHorizontal: 16,
        alignItems: "center"
    }
});
