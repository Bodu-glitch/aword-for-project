import { useAppSelector } from "@/lib/hooks";
import { Vocabulary } from "@/models/Vocabulary";
import { fetchAllVocabulary, fetchVocabularyList } from "@/supabase/vocabulary";
import { getColors } from "@/utls/colors";
import { getPartOfSpeechFull } from "@/utls/get_part_of_speechfull";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SCROLL_DELAY_MS = 250;

const Wordex = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string>("");
  const [groupedData, setGroupedData] = useState<
    Record<string, { name: string; words: Vocabulary[] }>
  >({});
  const [loading, setLoading] = useState(true);

  const searchQuery = useAppSelector((state) => state.search.query);

  const outerListRef = useRef<FlatList<string> | null>(null);
  const innerListRefs = useRef<Record<string, FlatList<Vocabulary> | null>>({});

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = async () => {
    setLoading(true);
    try {
      const grouped = await fetchAllVocabulary();

      if (grouped && !Array.isArray(grouped)) {
        // assume correct object shape
        setGroupedData(
          grouped as Record<string, { name: string; words: Vocabulary[] }>,
        );
      } else if (Array.isArray(grouped)) {
        // fallback: single group
        setGroupedData({
          all: { name: "All", words: grouped as Vocabulary[] },
        });
      } else {
        // final fallback: flat list
        const flat = await fetchVocabularyList(100);
        setGroupedData(
          flat.length ? { all: { name: "All", words: flat } } : {},
        );
      }
    } catch (e) {
      console.error("loadVocabulary error", e);
      setGroupedData({});
    } finally {
      setLoading(false);
    }
  };

  // Filter groups by search: match group name or any word inside
  const filteredGroupKeys = (() => {
    const keys = Object.keys(groupedData);
    if (!search.trim()) return keys;
    const q = search.toLowerCase();
    return keys.filter((k) => {
      const g = groupedData[k];
      if (!g) return false;
      if (g.name.toLowerCase().includes(q) || k.toLowerCase().includes(q))
        return true;
      return g.words?.some((w) => (w.word || "").toLowerCase().includes(q));
    });
  })();

  // Auto expand + scroll on global searchQuery change
  useEffect(() => {
    // If search query cleared -> collapse all and scroll to top
    if (!searchQuery || searchQuery.trim() === "") {
      setSearch("");
      setExpanded("");
      try {
        outerListRef.current?.scrollToOffset({ offset: 0, animated: true });
      } catch {}
      return; // stop further expand logic
    }
    if (Object.keys(groupedData).length === 0) return;
    setSearch(searchQuery); // sync to local
    const q = searchQuery.toLowerCase();

    const keys = Object.keys(groupedData);
    let targetGroup: string | null = null;
    let targetWordIndex = -1;
    let targetGroupIndex = -1;
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const words = groupedData[key]?.words || [];
      const idx = words.findIndex((w) =>
        (w.word || "").toLowerCase().includes(q),
      );
      if (idx >= 0) {
        targetGroup = key;
        targetWordIndex = idx;
        targetGroupIndex = i;
        break;
      }
    }
    if (!targetGroup) return;
    setExpanded(targetGroup);
    try {
      outerListRef.current?.scrollToIndex({
        index: targetGroupIndex,
        animated: true,
        viewPosition: 0.2,
      });
    } catch {}
    const inner = innerListRefs.current[targetGroup];
    if (inner && targetWordIndex >= 0) {
      try {
        inner.scrollToIndex({
          index: targetWordIndex,
          animated: true,
          viewPosition: 0.5,
        });
      } catch {}
    }
  }, [searchQuery, groupedData]);

  const renderItem: ListRenderItem<Vocabulary> = ({ item }) => (
    <View
      style={{
        marginTop: 12,
        paddingLeft: 12,
        borderLeftWidth: 2,
        borderColor: colors.accent.blue,
      }}
    >
      <View className={"gap-2 flex-row items-center"}>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: 20,
            fontWeight: "700",
          }}
        >
          {item.word}
        </Text>
        <Text className="text-sm " style={{ color: colors.text.secondary }}>
          {getPartOfSpeechFull(item.pos ?? "")}
        </Text>
      </View>
      <Text className="text-lg mb-2" style={{ color: colors.text.secondary }}>
        {item.phonetic}
      </Text>
      <Text className="text-lg mb-2" style={{ color: colors.text.primary }}>
        {item.definition_vi}
      </Text>

      {/* Example */}
      {item.example_en && (
        <View
          className="mt-2 mb-2 p-2 rounded-lg"
          style={{ backgroundColor: colors.background.primary }}
        >
          <Text
            className="text-base italic mb-1"
            style={{ color: colors.text.secondary }}
          >
            {item.example_en}
          </Text>
          {item.example_vi && (
            <Text
              className="text-base"
              style={{ color: colors.text.secondary }}
            >
              {item.example_vi}
            </Text>
          )}
        </View>
      )}

      {/* Word Anatomy */}
      {(item.prefix || item.infix || item.postfix) && (
        <View className="mt-2">
          <Text
            className="text-base font-bold mb-2"
            style={{ color: colors.text.primary }}
          >
            Anatomy:
          </Text>

          {item.prefix && (
            <View className="flex-row items-center mb-1">
              <View
                className="px-2 py-1 rounded-md mr-2"
                style={{ backgroundColor: colors.accent.red }}
              >
                <Text className="text-xs text-white font-medium">Prefix</Text>
              </View>
              <Text
                className="text-base font-semibold mr-2"
                style={{ color: colors.accent.red }}
              >
                {item.prefix}-
              </Text>
              <Text
                className="text-sm flex-1"
                style={{ color: colors.text.secondary }}
              >
                {item.prefix_meaning}
              </Text>
            </View>
          )}

          {item.infix && (
            <View className="flex-row items-center mb-1">
              <View
                className="px-2 py-1 rounded-md mr-2"
                style={{ backgroundColor: colors.accent.purple }}
              >
                <Text className="text-xs text-white font-medium">Infix</Text>
              </View>
              <Text
                className="text-base font-semibold mr-2"
                style={{ color: colors.accent.purple }}
              >
                -{item.infix}-
              </Text>
              <Text
                className="text-sm flex-1"
                style={{ color: colors.text.secondary }}
              >
                {item.infix_meaning}
              </Text>
            </View>
          )}

          {item.postfix && (
            <View className="flex-row items-center mb-1">
              <View
                className="px-2 py-1 rounded-md mr-2"
                style={{ backgroundColor: colors.accent.green }}
              >
                <Text className="text-xs text-white font-medium">Postfix</Text>
              </View>
              <Text
                className="text-base font-semibold mr-2"
                style={{ color: colors.accent.green }}
              >
                -{item.postfix}
              </Text>
              <Text
                className="text-sm flex-1"
                style={{ color: colors.text.secondary }}
              >
                {item.postfix_meaning}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={{ marginTop: 16, color: colors.text.secondary }}>
            Đang tải từ vựng...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <FlatList
        ref={outerListRef}
        data={filteredGroupKeys}
        keyExtractor={(k) => k}
        renderItem={({ item: groupKey }) => {
          const group = groupedData[groupKey];
          if (!group) return null;
          return (
            <View
              style={{
                margin: 12,
                padding: 12,
                borderRadius: 16,
                backgroundColor: colors.background.secondary,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onPress={() =>
                  setExpanded(expanded === groupKey ? "" : groupKey)
                }
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "700",
                      color: colors.text.primary,
                    }}
                  >
                    {group.name}
                  </Text>
                  <Text style={{ marginTop: 4, color: colors.text.secondary }}>
                    {group.words.length} từ
                  </Text>
                </View>
                <Ionicons
                  name={expanded === groupKey ? "chevron-up" : "chevron-down"}
                  size={28}
                  color={colors.text.primary}
                />
              </TouchableOpacity>
              {expanded === groupKey && (
                <View style={{ marginTop: 8 }}>
                  <FlatList
                    ref={(r) => {
                      innerListRefs.current[groupKey] = r;
                    }}
                    data={group.words}
                    keyExtractor={(w) => String(w.id)}
                    renderItem={renderItem}
                    scrollEnabled={false}
                  />
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={() => {
          return (
            <View className="flex-1 justify-center items-center p-6">
              <Image
                source={require("../../../assets/images/login-icon.png")}
                style={{ width: 160, height: 160, marginBottom: 20 }}
                resizeMode="contain"
              />
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.text.primary, marginBottom: 6 }}
              >
                Chưa có từ vựng
              </Text>
              <Text style={{ color: colors.text.secondary, textAlign: "center" }}>
                Bắt đầu học để thêm từ vựng và luyện tập.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/learning")}
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
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Wordex;
