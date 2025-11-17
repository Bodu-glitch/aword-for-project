import React from "react";
import { router, Stack, useRouter } from "expo-router";
import { Pressable, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "@/utls/colors";
import { useColorScheme } from "nativewind";

const AdminLayout = () => {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Admin",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.primary}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="vocab"
        options={{ headerShown: true, title: "Vocab" }}
      />
      <Stack.Screen
        name="root"
        options={{ headerShown: true, title: "Root" }}
      />
      <Stack.Screen
        name="vocab_senses"
        options={{ headerShown: true, title: "Vocab Senses" }}
      />
      <Stack.Screen
        name="vocab_examples"
        options={{ headerShown: true, title: "Vocab Examples" }}
      />
    </Stack>
  );
};

export default AdminLayout;
