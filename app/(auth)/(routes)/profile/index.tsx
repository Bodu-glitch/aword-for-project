import SignOutButton from "@/components/SignOutButton";
import {
  useGetProfileQuery,
  useGetTotalExpQuery,
  useGetLastWeekRankQuery,
} from "@/lib/features/profile/profileApi";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Image, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

const Profile = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [modalVisible, setModalVisible] = useState(false);
  const user = useAppSelector((state) => state.auth.auth);
  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery();

  // Helper function to get avatar URL from path
  const getAvatarUrl = (avatarPath: string | null | undefined): string => {
    if (!avatarPath) {
      return user.avatar_url || "https://i.pravatar.cc/150";
    }
    // If it's already a full URL, return it
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }
    // Otherwise, it's a path in storage, get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
    return data.publicUrl;
  };

  // Use RTK Query to get total EXP for current authenticated user
  const {
    data: totalExpData,
    isLoading: isLoadingTotalExp,
    refetch: refetchTotalExp,
  } = useGetTotalExpQuery();

  const {
    data: lastWeekData,
    isLoading: isLoadingLastWeek,
    refetch: refetchLastWeek,
  } = useGetLastWeekRankQuery();

  // Refetch total EXP and last week rank when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      if (typeof refetchTotalExp === "function") refetchTotalExp();
      if (typeof refetchLastWeek === "function") refetchLastWeek();
    }, [refetchTotalExp, refetchLastWeek]),
  );

  // Derive display values
  const streaks = profile?.streak_days ?? 0;
  const totalExp = totalExpData ?? 0;

  const menuItems = [
    {
      key: "edit",
      icon: "person-outline" as const,
      label: "Edit Profile",
      onPress: () => router.push("/profile/edit"),
    },
    {
      key: "achievements",
      icon: "trophy-outline" as const,
      label: "Achievements",
      onPress: () => router.push("/profile/achievements"),
    },
  ];

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          className="flex-1 justify-end"
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            className="h-40 p-6 border-t w-full rounded-t-3xl"
            style={{
              backgroundColor: colors.background.secondary,
              borderTopColor: colors.border.primary,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="w-full items-end">
              <SignOutButton />
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row items-center justify-between">
            <Pressable onPress={() => router.back()}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={colors.text.primary}
              />
            </Pressable>
            <Text
              className="text-xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Profile
            </Text>
            <Pressable onPress={() => setModalVisible(true)}>
              <Ionicons
                name="ellipsis-vertical"
                size={24}
                color={colors.text.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* User Profile Section */}
        <View className="items-center px-6 mb-8">
          {/* Avatar with Edit Button */}
          <View className="relative mb-4">
            <View className="w-32 h-32 rounded-full overflow-hidden">
              <Image
                source={{
                  uri:
                    getAvatarUrl(profile?.avatar_url) ||
                    user.avatar_url ||
                    "https://i.pravatar.cc/150",
                }}
                className="w-full h-full"
              />
            </View>
          </View>

          {/* Name */}
          <Text
            className="text-2xl font-bold mb-1"
            style={{ color: colors.text.primary }}
          >
            {profile?.full_name || user.name || "User"}
          </Text>

          {/* Email */}
          <Text className="text-base" style={{ color: colors.text.secondary }}>
            {profile?.email || user.email || "No email"}
          </Text>
        </View>

        {/* Statistics Section - show per-stat loading as '-' until loaded */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-around">
            {/* Streak Stat */}
            <View className="items-center flex-1">
              <View className="mb-2">
                <Ionicons name="flame" size={28} color={colors.accent.red} />
              </View>
              <Text
                className="text-xl font-bold mb-1"
                style={{ color: colors.text.primary }}
              >
                {isLoadingProfile ? "-" : streaks}
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Streak
              </Text>
            </View>

            {/* EXP Stat */}
            <View className="items-center flex-1">
              <View className="mb-2">
                <Ionicons name="flash" size={28} color={colors.accent.yellow} />
              </View>
              <Text
                className="text-xl font-bold mb-1"
                style={{ color: colors.text.primary }}
              >
                {isLoadingTotalExp ? "-" : totalExp}
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Total EXP
              </Text>
            </View>

            {/* Last Week Rank Stat */}
            <View className="items-center flex-1">
              <View className="mb-2">
                <Ionicons
                  name="diamond"
                  size={28}
                  color={colors.accent.yellow}
                />
              </View>
              <Text
                className="text-xl font-bold mb-1"
                style={{ color: colors.text.primary }}
              >
                {isLoadingLastWeek || !lastWeekData || lastWeekData.rank == null
                  ? "-"
                  : `Top ${lastWeekData.rank}`}
              </Text>
              <Text
                className="text-xs"
                style={{ color: colors.text.secondary }}
              >
                Last Week
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6">
          {menuItems.map((item, index) => (
            <Pressable
              key={item.key}
              className="flex-row items-center justify-between py-4"
              style={{
                borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
                borderBottomColor: colors.border.primary,
              }}
              onPress={item.onPress}
            >
              <View className="flex-row items-center flex-1">
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={colors.text.primary}
                />
                <Text
                  className="ml-4 text-base"
                  style={{ color: colors.text.primary }}
                >
                  {item.label}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.secondary}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
