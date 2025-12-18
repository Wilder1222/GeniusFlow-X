import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
    return (
        <SafeAreaView className="flex-1 bg-white items-center justify-center">
            <View className="p-4 bg-blue-500 rounded-2xl shadow-lg">
                <Text className="text-2xl font-bold text-white text-center">
                    GeniusFlow-X
                </Text>
                <Text className="text-lg text-blue-100 mt-2 text-center">
                    Mobile App is Ready! 🚀
                </Text>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    );
}
