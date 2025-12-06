import { supabase } from "@/lib/supabase";
import React from "react";
import { Pressable, Text } from "react-native";
import { useColorScheme } from "nativewind";
import { useDispatch } from "react-redux";
import { clearAuth } from "@/lib/features/auth/authSlice";
import { profileApi } from "@/lib/features/profile/profileApi";
import { vocabApi } from "@/lib/features/vocab/vocabApi";
import { learnApi } from "@/lib/features/learn/learnApi";
import { leaderboardApi } from "@/lib/features/leaderboard/leaderboardApi";
import { adminApi } from "@/lib/features/admin/adminApi";
import { useRouter } from "expo-router";

export default function SignOutButton() {
  const { colorScheme } = useColorScheme();
  const dispatch = useDispatch();
  const router = useRouter();

  const onSignOutButtonPress = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        return;
      }

      // Clear local Redux auth state
      try {
        dispatch(clearAuth());
      } catch (e) {
        console.debug("clearAuth dispatch failed", e);
      }

      // Reset RTK Query caches for all APIs so UI is cleared immediately
      try {
        dispatch(profileApi.util.resetApiState());
        dispatch(vocabApi.util.resetApiState());
        dispatch(learnApi.util.resetApiState());
        dispatch(leaderboardApi.util.resetApiState());
        dispatch(adminApi.util.resetApiState());
      } catch (e) {
        console.debug("resetApiState failed", e);
      }

      // Optionally redirect to root/login screen
      try {
        router.replace("/");
      } catch (e) {
        // ignore navigation errors
        console.debug("router.replace failed", e);
      }
    } catch (e) {
      console.error("Unexpected sign out error:", e);
    }
  };

  return (
    <Pressable
      className={`rounded-2xl shadow-sm `}
      style={{
        backgroundColor: colorScheme === "dark" ? "#C73133" : "#C73133",
      }}
      onPress={onSignOutButtonPress}
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
