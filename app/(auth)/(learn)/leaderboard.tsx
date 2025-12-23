import { useGetCurrentWeekLeaderboardQuery } from "@/lib/features/leaderboard/leaderboardApi";
import { supabase } from "@/lib/supabase";
import { getColors } from "@/utls/colors";
import { useRouter } from "expo-router";
import { Avatar, Divider } from "heroui-native";
import { useColorScheme } from "nativewind";
import React, { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";

const Leaderboard = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const {
    data: entries,
    isLoading,
    isError,
  } = useGetCurrentWeekLeaderboardQuery();

  // Helper to transform storage path -> public URL
  const getAvatarUrl = (avatarPath?: string | null): string | undefined => {
    if (!avatarPath) return undefined;
    if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
      return avatarPath;
    }
    try {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(avatarPath);
      return data.publicUrl;
    } catch {
      return undefined;
    }
  };

  // Sort by rank to ensure correct order regardless of backend ordering
  const sorted = useMemo(
    () => (entries ? [...entries].sort((a, b) => a.rank - b.rank) : []),
    [entries],
  );
  const topThree = useMemo(() => sorted.slice(0, 3), [sorted]);
  const isEmpty = !isLoading && sorted.length === 0;

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Header */}
      {!isEmpty && (
        <>
          <View className="px-5 pt-6 pb-3">
            <View
              className="mt-3 self-start px-3 py-1 rounded-full"
              style={{ backgroundColor: colors.surface.tertiary }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: colors.text.primary }}
              >
                This week
              </Text>
            </View>
          </View>

          <Divider />
        </>
      )}

      {/* Top 3 */}
      <View className="px-5 py-4">
        {isLoading ? (
          <Top3Skeleton
            colors={{
              chip: colors.surface.secondary,
              text: colors.text.primary,
            }}
          />
        ) : isError ? (
          <Text style={{ color: colors.text.secondary }}>
            Failed to load leaderboard.
          </Text>
        ) : (
          <Top3
            entries={topThree}
            getAvatarUrl={getAvatarUrl}
            colors={colors}
          />
        )}
      </View>

      {!isEmpty && <Divider />}

      {/* List */}
      <ScrollView className="flex-1 pt-2 h-full">
        <View className="px-5 py-5">
          {isLoading ? (
            <ListSkeleton colors={{ row: colors.surface.secondary }} />
          ) : (
            <View className="flex flex-col gap-4">
              {sorted.map((item) => (
                <View
                  key={`${item.profile.id}-${item.rank}`}
                  className="w-full flex flex-row gap-3 items-center"
                >
                  <Text
                    className="w-8 text-center font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    {item.rank}
                  </Text>
                  <ProfileRow
                    name={
                      item.profile.full_name || item.profile.email || "User"
                    }
                    avatarUrl={
                      getAvatarUrl(item.profile.avatar_url) ||
                      "https://cdn-icons-png.flaticon.com/512/3237/3237472.png"
                    }
                    points={item.points_total}
                    colors={colors}
                  />
                </View>
              ))}
              {sorted.length === 0 && !isLoading && (
                <EmptyLeaderboard colors={colors} />
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const ProfileRow = (props: {
  name: string;
  avatarUrl: string;
  points: number;
  colors: ReturnType<typeof getColors>;
}) => {
  const { name, avatarUrl, points, colors } = props;
  return (
    <View className="flex-row items-center justify-between flex-1">
      <View className="flex-row items-center gap-2">
        <Avatar size="sm" alt="">
          <Avatar.Image source={{ uri: avatarUrl }} />
          <Avatar.Fallback>{name?.[0] ?? "U"}</Avatar.Fallback>
        </Avatar>
        <Text
          className="text-lg font-semibold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ color: colors.text.primary, maxWidth: 180, flexShrink: 1 }}
        >
          {name}
        </Text>
      </View>
      <Text style={{ color: colors.text.secondary }}>{points} pts</Text>
    </View>
  );
};

// Helper to add alpha to hex color (#RRGGBB -> #RRGGBBAA)
const withAlpha = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith("#") || (hex.length !== 7 && hex.length !== 9)) {
    return hex;
  }
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  // If already #RRGGBBAA, replace AA; else append AA
  return hex.length === 9 ? `${hex.slice(0, 7)}${a}` : `${hex}${a}`;
};

const Top3 = ({
  entries,
  getAvatarUrl,
  colors,
}: {
  entries: {
    profile: { full_name: string; email: string; avatar_url: string };
    points_total: number;
    rank: number;
  }[];
  getAvatarUrl: (path?: string | null) => string | undefined;
  colors: ReturnType<typeof getColors>;
}) => {
  if (!entries || entries.length === 0) return null;

  const sizes = [64, 88, 64]; // left(2nd), center(1st), right(3rd)
  const order = [1, 0, 2]; // display: 2nd, 1st, 3rd
  const ITEM_WIDTH = 110; // fixed width to prevent layout shift on long names

  return (
    <View className="w-full flex-row items-end justify-center">
      {order.map((i, displayIdx) => {
        const e = entries[i];
        if (!e)
          return (
            <View
              key={`empty-${i}`}
              style={{ width: ITEM_WIDTH, alignItems: "center" }}
            />
          );
        const avatar =
          getAvatarUrl(e.profile.avatar_url) ||
          "https://cdn-icons-png.flaticon.com/512/3237/3237472.png";
        const name = e.profile.full_name || e.profile.email || "User";
        const circleBg = [
          colors.accent.blue,
          colors.accent.purple,
          colors.accent.orange,
        ][displayIdx];
        const size = sizes[displayIdx];
        return (
          <View
            key={`top3-${e.profile.email}-${e.rank}`}
            style={{
              width: ITEM_WIDTH,
              alignItems: "center",
              marginHorizontal: 6,
            }}
          >
            <View
              className="rounded-full items-center justify-center"
              style={{
                width: size + 14,
                height: size + 14,
                backgroundColor: withAlpha(circleBg, 0.2),
              }}
            >
              <Image
                source={{ uri: avatar }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
              />
            </View>
            <View
              className="px-2 py-0.5 rounded-full mt-2"
              style={{ backgroundColor: colors.surface.tertiary }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: colors.text.primary }}
              >
                #{e.rank} • {e.points_total}
              </Text>
            </View>
            <Text
              className="mt-1 text-sm font-semibold"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                color: colors.text.primary,
                width: ITEM_WIDTH - 10,
                textAlign: "center",
              }}
            >
              {name}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const Top3Skeleton = ({
  colors,
}: {
  colors: { chip: string; text: string };
}) => {
  const ITEM_WIDTH = 110;
  const circleSizes = [64, 88, 64];
  return (
    <View className="w-full flex-row items-end justify-center">
      {circleSizes.map((size, idx) => (
        <View
          key={`sk-${idx}`}
          style={{
            width: ITEM_WIDTH,
            alignItems: "center",
            marginHorizontal: 6,
          }}
        >
          <View
            className="rounded-full"
            style={{
              width: size + 14,
              height: size + 14,
              backgroundColor: colors.chip,
              opacity: 0.4,
            }}
          />
          <View
            className="mt-2 rounded-full"
            style={{
              width: 60,
              height: 16,
              backgroundColor: colors.chip,
              opacity: 0.3,
            }}
          />
          <View
            className="mt-1 rounded"
            style={{
              width: ITEM_WIDTH - 10,
              height: 14,
              backgroundColor: colors.chip,
              opacity: 0.3,
            }}
          />
        </View>
      ))}
    </View>
  );
};

const ListSkeleton = ({ colors }: { colors: { row: string } }) => {
  return (
    <View className="flex flex-col gap-4">
      {Array.from({ length: 8 }).map((_, idx) => (
        <View key={`sk-${idx}`} className="w-full flex-row items-center gap-3">
          <View
            className="w-8 h-4 rounded"
            style={{ backgroundColor: colors.row }}
          />
          <View
            className="w-10 h-10 rounded-full"
            style={{ backgroundColor: colors.row }}
          />
          <View
            className="flex-1 h-5 rounded"
            style={{ backgroundColor: colors.row }}
          />
          <View
            className="w-12 h-4 rounded"
            style={{ backgroundColor: colors.row }}
          />
        </View>
      ))}
    </View>
  );
};

const EmptyLeaderboard = ({
  colors,
}: {
  colors: ReturnType<typeof getColors>;
}) => {
  const router = useRouter();

  return (
    <View className="items-center justify-center py-8">
      <Image
        source={require("../../../assets/images/login-icon.png")}
        style={{ width: 160, height: 160, marginBottom: 20 }}
        resizeMode="contain"
      />
      <Text
        className="text-lg font-bold"
        style={{ color: colors.text.primary, marginBottom: 6 }}
      >
        Chưa có người dùng nào
      </Text>
      <Text style={{ color: colors.text.secondary, textAlign: "center" }}>
        Tuần mới bắt đầu — hãy học vài bài để xuất hiện trên bảng xếp hạng!
      </Text>

      <Pressable
        onPress={() => router.replace("/learning")}
        style={{
          marginTop: 18,
          backgroundColor: colors.primary.main,
          paddingHorizontal: 18,
          paddingVertical: 10,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: colors.text.header, fontWeight: "600" }}>
          Bắt đầu học
        </Text>
      </Pressable>
    </View>
  );
};

export default Leaderboard;
