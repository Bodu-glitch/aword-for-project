import { useGetProfileQuery } from "@/lib/features/profile/profileApi";
import { useGetTotalLearnedVocabCountQuery } from "@/lib/features/vocab/vocabApi";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { getColors } from "@/utls/colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import { Button } from "heroui-native";
import LottieView from "lottie-react-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const flameAnimation = useRef<LottieView>(null);
  const gradientAnimation = useRef(new Animated.Value(0)).current;
  const user = useAppSelector((state) => state.auth.auth);
  const { colorScheme } = useColorScheme();
  const { data: profile, isLoading: isLoadingProfile } = useGetProfileQuery();
  const { data: vocabCount, isLoading: isLoadingVocabCount } =
    useGetTotalLearnedVocabCountQuery();

  const colors = getColors(colorScheme === "dark");

  // Helper function to get avatar URL from path
  const getAvatarUrl = (avatarPath: string | null | undefined): string => {
    if (!avatarPath) {
      return user.avatar_url || "https://i.pravatar.cc/100";
    }
    // If it's already a full URL, return it
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }
    // Otherwise, it's a path in storage, get public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(avatarPath);
    return data.publicUrl;
  };

  // helpers to check dates (local day comparison)
  const parseLocalDate = (iso?: string | null) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return d;
  };

  const isSameLocalDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const lastActive = parseLocalDate(profile?.last_active_at ?? null);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isTodayActive = lastActive ? isSameLocalDay(lastActive, today) : false;
  const isYesterdayActive = lastActive
    ? isSameLocalDay(lastActive, yesterday)
    : false;

  useEffect(() => {
    // Only run Lottie and gradient when user was active today
    if (isTodayActive) {
      flameAnimation.current?.play();

      const animateGradient = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(gradientAnimation, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(gradientAnimation, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: false,
            }),
          ]),
        ).start();
      };
      animateGradient();
    } else {
      // reset gradient value so Animated.Text won't show previous interpolation
      gradientAnimation.setValue(0);
    }
  }, [isTodayActive]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900 px-5 pt-10">
      {/* Header */}
      <View className="flex-row justify-between items-start">
        {/* Left: avatar + name and small Admin button underneath */}
        <View>
          <Pressable
            onPress={() => router.push("/profile")}
            className="flex-row items-center"
          >
            {isLoadingProfile ? (
              <View className="flex-row items-center">
                <View
                  className="w-10 h-10 rounded-full mr-2"
                  style={{ backgroundColor: colors.surface.secondary }}
                />
                <View
                  className="h-4 w-24 rounded"
                  style={{ backgroundColor: colors.surface.secondary }}
                />
              </View>
            ) : (
              <>
                <Image
                  source={{
                    uri:
                      getAvatarUrl(profile?.avatar_url) ||
                      user.avatar_url ||
                      "https://i.pravatar.cc/100",
                  }}
                  className="w-10 h-10 rounded-full mr-2"
                />
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                  {profile?.full_name || user.name || "User"}
                </Text>
              </>
            )}
          </Pressable>

          {profile?.role === "admin" && (
            // Small Admin button under avatar
            <View style={{ marginTop: 8 }}>
              <Button
                size="sm"
                variant={colorScheme === "dark" ? "tertiary" : "tertiary"}
                onPress={() => router.push("/admin")}
              >
                Admin
              </Button>
            </View>
          )}
        </View>

        <View className="flex-row">
          <Link href={"/setting"} asChild>
            <Pressable className="ml-3">
              <Ionicons
                name="settings-outline"
                size={32}
                color={colors.text.primary}
              />
            </Pressable>
          </Link>
        </View>
      </View>

      {/* Streak */}
      <View className="flex-row items-center mt-6 self-end">
        {isTodayActive ? (
          <LottieView
            ref={flameAnimation}
            autoPlay
            loop
            style={{ width: 40, height: 40 }}
            source={require("../../../assets/animations/streak-fire.json")}
          />
        ) : isYesterdayActive ? (
          <MaterialCommunityIcons
            name="fire"
            size={40}
            color={colors.text.secondary}
          />
        ) : null}

        {isLoadingProfile ? (
          <></>
        ) : isTodayActive ? (
          <Animated.Text
            className="ml-2 font-semibold text-2xl"
            style={{
              color: gradientAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: ["#FF6B35", "#FFD23F", "#FF6B35"],
              }),
            }}
          >
            {profile ? profile.streak_days : "0"} streak
          </Animated.Text>
        ) : isYesterdayActive ? (
          <Text
            className="ml-2 font-semibold text-2xl"
            style={{ color: colors.text.secondary }}
          >
            {profile ? profile.streak_days : 0} streak
          </Text>
        ) : (
          <Text
            className="ml-2 font-semibold text-2xl"
            style={{ color: colors.text.secondary }}
          >
            0 streak
          </Text>
        )}
      </View>

      {/* Title */}
      {isLoadingVocabCount ? (
        <Text className="text-5xl font-semibold text-gray-600 dark:text-gray-300 my-8 text-right">
          0 words
        </Text>
      ) : (
        <Text className="text-5xl font-semibold text-gray-600 dark:text-gray-300 my-8 text-right">
          {vocabCount} words
        </Text>
      )}

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Menu buttons */}
        <Link href="/learning/select-root" asChild>
          <Pressable
            className="mb-6 rounded-2xl shadow-sm"
            style={{ backgroundColor: colors.primary.main }}
          >
            <View className="flex-row items-center p-5">
              <MaterialCommunityIcons
                name="book-open-page-variant"
                size={48}
                color={colors.text.button}
              />
              <View className="ml-5">
                <Text
                  className="font-semibold text-3xl"
                  style={{ color: colors.text.button }}
                >
                  Learning
                </Text>
                <Text className="text-lg" style={{ color: colors.text.button }}>
                  lesson #20
                </Text>
              </View>
            </View>
          </Pressable>
        </Link>

        <Link href={"/flashcard"} asChild>
          <Pressable
            className="mb-6 rounded-2xl shadow-sm"
            style={{ backgroundColor: colors.primary.main }}
          >
            <View className="flex-row items-center p-5">
              <MaterialCommunityIcons
                name="cards-outline"
                size={48}
                color={colors.text.button}
              />
              <View className="ml-5">
                <Text
                  className="font-semibold text-3xl"
                  style={{ color: colors.text.button }}
                >
                  Flashcard
                </Text>
                <Text className="text-lg" style={{ color: colors.text.button }}>
                  No. of card 30
                </Text>
              </View>
            </View>
          </Pressable>
        </Link>

        <Link href={"/wordex"} asChild>
          <Pressable
            className="mb-6 rounded-2xl shadow-sm"
            style={{ backgroundColor: colors.primary.main }}
          >
            <View className="flex-row items-center p-5">
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.text.button}
              />
              <View className="ml-5">
                <Text
                  className="font-semibold text-3xl"
                  style={{ color: colors.text.button }}
                >
                  Wordex
                </Text>
                <Text className="text-lg" style={{ color: colors.text.button }}>
                  Looking for a word
                </Text>
              </View>
            </View>
          </Pressable>
        </Link>

        <Link href={"/leaderboard"} asChild>
          <Pressable
            className="mb-6 rounded-2xl shadow-sm"
            style={{ backgroundColor: colors.primary.main }}
          >
            <View className="flex-row items-center p-5">
              <Ionicons
                name="ribbon-outline"
                size={48}
                color={colors.text.button}
              />
              <View className="ml-5">
                <Text
                  className="font-semibold text-3xl"
                  style={{ color: colors.text.button }}
                >
                  Leaderboard
                </Text>
                <Text className="text-lg" style={{ color: colors.text.button }}>
                  Your learning rank
                </Text>
              </View>
            </View>
          </Pressable>
        </Link>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
