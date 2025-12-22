import React, { useState } from "react";
import { Stack } from "expo-router";
import { useColorScheme } from "nativewind";
import { getColors } from "@/utls/colors";
import { Modal, View, Text, Pressable, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const LearningLayout = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const navigation = useNavigation();
  const [showConfirm, setShowConfirm] = useState(false);

  // Header back component that triggers the bottom modal
  const HeaderBack = () => (
    <TouchableOpacity
      onPress={() => setShowConfirm(true)}
      style={{ marginLeft: 12 }}
    >
      <Ionicons name="arrow-back" size={22} color={colors.text.header} />
    </TouchableOpacity>
  );

  return (
    <>
      <Stack
        screenOptions={{
          gestureEnabled: false,
          headerBackButtonMenuEnabled: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: colors.primary.main },
            headerTintColor: colors.text.button,
            headerLeft: () => <HeaderBack />,
            title: "Learning",
          }}
        />
        <Stack.Screen name="overview" options={{ headerShown: false }} />
      </Stack>

      {/* Bottom confirm modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background.secondary,
              padding: 16,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
            }}
          >
            <Text
              style={{
                color: colors.text.primary,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
              }}
            >
              Quit learning?
            </Text>
            <Text style={{ color: colors.text.secondary, marginBottom: 16 }}>
              Are you sure you want to go back? Your progress on this screen may
              be lost.
            </Text>

            <View style={{ flexDirection: "column" }}>
              <Pressable
                onPress={() => {
                  setShowConfirm(false);
                  // confirm -> go back
                  navigation.goBack?.();
                }}
                style={{
                  paddingVertical: 14,
                  borderRadius: 8,
                  backgroundColor: colors.primary.main,
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: colors.text.button, fontWeight: "600" }}>
                  Yes, go back
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowConfirm(false)}
                style={{
                  paddingVertical: 14,
                  borderRadius: 8,
                  backgroundColor: colors.surface.secondary,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.text.primary, fontWeight: "600" }}>
                  No, stay
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default LearningLayout;
