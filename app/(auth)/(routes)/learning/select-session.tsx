import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getColors } from "@/utls/colors";
import { useColorScheme } from "nativewind";
import { useNavigation } from "expo-router";
import { CommonActions } from "@react-navigation/native";

import {
  useAssignWordToRootMutation,
  useGetRootByIdQuery,
} from "@/lib/features/vocab/vocabApi";

const { width } = Dimensions.get("window");

const OPTIONS = [
  { id: "5", title: "5 Words", subtitle: "Quick Review", approx: "~2 mins" },
  { id: "10", title: "10 Words", subtitle: "Standard", approx: "~5 mins" },
  { id: "15", title: "15 Words", subtitle: "Deep Dive", approx: "~8 mins" },
];

export default function SelectSession() {
  const { chapter } = useLocalSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [assignWordToRoot, { isSuccess }] = useAssignWordToRootMutation();

  const result = useGetRootByIdQuery(chapter as string);
  const selectedChapter = result.data;
  const navigation = useNavigation();

  React.useEffect(() => {
    // Chỉ chạy khi thành công và có selected
    if (isSuccess && selected && selectedChapter) {
      // 1. Ngắt vòng lặp ngay lập tức để tránh crash app nếu navigation thất bại
      const currentSelected = selected;
      setSelected(null);

      // 2. Thực hiện Reset
      try {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [
              {
                // TRONG EXPO ROUTER: Thường tên route là tên file (không bao gồm path hay nhóm ())
                // Hãy thử đổi thành "learning"
                name: "learning",
                params: {
                  rootId: selectedChapter.id,
                  wordCount: currentSelected,
                },
              },
            ],
          }),
        );
      } catch (error) {
        console.log("Lỗi navigation:", error);
      }
    }
  }, [isSuccess, selected, selectedChapter, navigation]);

  async function onConfirm() {
    if (!selected || !selectedChapter) return;
    await assignWordToRoot({
      rootId: selectedChapter.id,
      wordCount: parseInt(selected, 10),
    });
  }

  if (result.isLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading chapter data...</Text>
      </View>
    );
  }

  if (!selectedChapter) {
    return (
      <View style={styles.center}>
        <Text>Chapter not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.page, { padding: 16 }]}>
      <Text style={[styles.title, { color: colors.primary?.main }]}>
        Choose Your Study Session
      </Text>
      <Text style={[styles.subhead, { color: "#000000ff" }]}>
        Select how many words you want to practice
      </Text>

      <View style={styles.chapterBox}>
        <Text style={[styles.chapterTitle, { color: colors.primary?.main }]}>
          {selectedChapter.root_code}
        </Text>
        <Text
          style={[
            styles.chapterKeyword,
            { color: colors.primary?.main ?? "#2a4cf3" },
          ]}
        >
          {selectedChapter.word_count} words
        </Text>
        <Text style={[styles.chapterDesc, { color: "#000000ff" }]}>
          {selectedChapter.root_meaning}
        </Text>
      </View>

      <View style={{ height: 12 }} />

      <View style={styles.list}>
        {OPTIONS.map((o) => {
          const active = selected === o.id;
          return (
            <Pressable
              key={o.id}
              onPress={() => setSelected(o.id)}
              style={[
                styles.option,
                active && {
                  borderColor: colors.primary.main,
                  backgroundColor: "#fff",
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  active && { backgroundColor: colors.primary.main },
                ]}
              >
                <Ionicons
                  name="flash"
                  size={20}
                  color={active ? "#fff" : colors.primary.main}
                />
              </View>

              <View style={styles.meta}>
                <View style={styles.optTitleRow}>
                  <Text
                    style={[
                      styles.optTitle,
                      { color: colors.primary?.main ?? "#2a4cf3" },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {o.title}
                  </Text>

                  <Text
                    style={[
                      styles.approx,
                      { color: colors.primary?.main ?? "#2a4cf3" },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {o.approx}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.optSubTitle,
                    { color: colors.primary?.main ?? "#2a4cf3", marginTop: 6 },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {o.subtitle}
                </Text>
              </View>

              <View style={styles.radioWrap}>
                <View
                  style={[
                    styles.radioOuter,
                    active && { borderColor: colors.primary.main },
                  ]}
                >
                  {active && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: colors.primary.main },
                      ]}
                    />
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.confirm,
          selected
            ? { backgroundColor: colors.primary.main }
            : { backgroundColor: "#e6e6e6" },
        ]}
        onPress={onConfirm}
        disabled={!selected}
        activeOpacity={selected ? 0.8 : 1}
      >
        <Text style={[styles.confirmText, selected && { color: "#fff" }]}>
          Start Practice
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  subhead: { color: "#666", marginBottom: 12 },
  chapterBox: { backgroundColor: "transparent", paddingVertical: 8 },
  chapterTitle: { fontSize: 16, fontWeight: "700" },
  chapterKeyword: { marginTop: 4, fontWeight: "700" },
  chapterDesc: { marginTop: 6, fontSize: 13 },

  list: { gap: 12 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    width: width * 0.95,
    alignSelf: "center",
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(42,76,243,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "rgba(42,76,243,0.08)",
  },
  meta: { flex: 1, marginRight: 8 },
  optTitleRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "baseline",
  },
  optTitle: { fontWeight: "700", fontSize: 15, flexShrink: 1, lineHeight: 20 },
  optSubTitle: { fontWeight: "500", fontSize: 13, marginTop: 4 },
  approx: { fontWeight: "500", fontSize: 13, lineHeight: 20, marginLeft: 8 },
  radioWrap: { marginLeft: 12 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: { width: 12, height: 12, borderRadius: 6 },

  confirm: {
    marginTop: 20,
    height: 48,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: width * 0.95,
    alignSelf: "center",
  },
  confirmText: { fontWeight: "700", color: "#999" },
});
