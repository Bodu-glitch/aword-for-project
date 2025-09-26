import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useAuthContext } from "@/hooks/use-auth-context";

const LearnLayout = () => {
  const router = useRouter();
  const { session } = useAuthContext();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#2563eb" }, // xanh cho toàn bộ
        headerTintColor: "white",
        headerTitleStyle: { color: "white" },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="wordex"
        options={{
          header: () => (
            <View
              style={{
                backgroundColor: "#2563eb",
                paddingHorizontal: 12,
                paddingTop: 100,
                paddingBottom: 38,
                flexDirection: "row",
                alignItems: "center",
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}
            >
              {/* Nút back */}
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={22} color="white" />
              </TouchableOpacity>

              {/* Ô search */}
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: 9999,
                  marginLeft: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                }}
              >
                <TextInput
                  style={{ flex: 1, fontSize: 16, color: "#333" }}
                  placeholder="Search here..."
                  placeholderTextColor="#999"
                />
                <Ionicons name="search" size={18} color="#999" />
              </View>
            </View>
          ),
        }}
      />

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="flashcard" options={{ title: "Flashcard" }} />
        <Stack.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
        <Stack.Screen
          name="learning"
          options={{
            title: "Learn",
          }}
        />
      </Stack.Protected>
    </Stack>
  );
};

export default LearnLayout;
