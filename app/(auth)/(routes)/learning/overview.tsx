import { Link } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const Overview = () => {
  const router = useRouter();
  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <View className="flex-1 justify-center items-center">
        <Text className="text-2xl font-bold text-gray-900 dark:text-white">
          Overview Page
        </Text>

        <Button
          title={"Hoâme"}
          onPress={() => {
            router.back();
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default Overview;
