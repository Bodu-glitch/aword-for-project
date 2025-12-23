import { supabase } from "@/lib/supabase";
import React from "react";
import { Pressable, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { profileApi } from "@/lib/features/profile/profileApi";
import { useDispatch } from "react-redux";

async function onSignOutButtonPress(dispatch: ReturnType<typeof useDispatch>) {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
  }

  dispatch(profileApi.util.resetApiState());
}

export default function SignOutButton() {
  const dispatch = useDispatch();

  const { colorScheme } = useColorScheme();

  return (
    <Pressable
      className={`rounded-2xl shadow-sm `}
      style={{
        backgroundColor: colorScheme === "dark" ? "#C73133" : "#C73133",
      }}
      onPress={() => onSignOutButtonPress(dispatch)}
    >
      <Text
        className="p-4 text-center font-medium"
        style={{ color: "#FFFFFF" }}
      >
        Sign Out
      </Text>
    </Pressable>
  );
}
