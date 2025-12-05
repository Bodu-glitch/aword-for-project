import React from "react";
import { Stack, useRouter } from "expo-router";
import { getColors } from "@/utls/colors";
import { useColorScheme } from "nativewind";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AdminLayout = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const router = useRouter();

  const commonHeader = {
    headerStyle: { backgroundColor: colors.primary.main },
    headerTitleStyle: { color: colors.text.header },
    headerTintColor: colors.text.header,
  } as const;

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Admin",
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.button}
              />
            </Pressable>
          ),
          ...commonHeader,
        }}
      />
      <Stack.Screen
        name="vocab"
        options={{ title: "Vocab", ...commonHeader }}
      />
      <Stack.Screen name="root" options={{ title: "Root", ...commonHeader }} />
      <Stack.Screen
        name="vocab_senses"
        options={{ title: "Vocab Senses", ...commonHeader }}
      />
      <Stack.Screen
        name="vocab_examples"
        options={{ title: "Vocab Examples", ...commonHeader }}
      />
      <Stack.Screen
        name="users"
        options={{ title: "Users", ...commonHeader }}
      />
      <Stack.Screen
        name="sub_vocab"
        options={{ title: "Sub Vocab", ...commonHeader }}
      />
      <Stack.Screen
        name="sub_roots"
        options={{ title: "Sub Roots", ...commonHeader }}
      />
      <Stack.Screen
        name="sub_vocab_examples"
        options={{ title: "Sub Vocab Examples", ...commonHeader }}
      />
      <Stack.Screen
        name="sub_vocab_senses"
        options={{ title: "Sub Vocab Senses", ...commonHeader }}
      />
    </Stack>
  );
};

export default AdminLayout;
