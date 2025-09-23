import React from "react";
import { Stack } from "expo-router";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LearnLayout = () => {
  const router = useRouter();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            accessibilityLabel="Exit"
            style={{ marginLeft: 16 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="learning"
        options={{
          title: "Learn",
        }}
      />
    </Stack>
  );
};

export default LearnLayout;
