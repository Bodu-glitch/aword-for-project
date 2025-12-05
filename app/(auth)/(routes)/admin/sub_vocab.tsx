import React, { useMemo, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Icon } from "react-native-elements";
import { useColorScheme } from "nativewind";
import { getColors } from "@/utls/colors";
import {
  useListSubVocabQuery,
  useUpsertSubVocabMutation,
  useDeleteSubVocabMutation,
  useListVocabSubRootsQuery,
} from "@/lib/features/admin/adminApi";
import SimpleEditModal from "@/components/SimpleEditModal";
import sanitizeUpsert from "@/utls/sanitizeUpsert";

export default function SubVocabPage() {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const [query, setQuery] = useState("");
  const { data: data = [], error, isLoading } = useListSubVocabQuery({});
  const { data: subRootsData } = useListVocabSubRootsQuery({});
  const [upsertSubVocab] = useUpsertSubVocabMutation();
  const [deleteSubVocab] = useDeleteSubVocabMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();

    const displaySource = data && data.length > 0 ? data : __DEV__ ? [] : [];
    if (!q) return displaySource;
    return (displaySource || []).filter((item: any) => {
      const word = (item.word || item.vocab?.word || "")
        .toString()
        .toLowerCase();
      const phonetic = (item.phonetic || item.vocab?.phonetic || "")
        .toString()
        .toLowerCase();
      return word.includes(q) || phonetic.includes(q);
    });
  }, [data, query]);

  useEffect(() => {
    try {
      console.log(
        "[SubVocab] data count:",
        Array.isArray(data) ? data.length : typeof data,
        data?.[0],
      );
      console.log(
        "[SubVocab] filtered count:",
        Array.isArray(filtered) ? filtered.length : typeof filtered,
      );
    } catch (e) {
      console.log("[SubVocab] debug error", e);
    }
  }, [data, filtered]);

  const handleDelete = async (id: string) => {
    await deleteSubVocab({ id }).unwrap();
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setModalVisible(true);
  };
  const handleAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };
  const onSubmit = async (values: any) => {
    const payload = sanitizeUpsert(values);
    await upsertSubVocab(payload as any).unwrap();
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.primary,
          borderColor: colors.border.primary,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <View>
          <View style={styles.wordRow}>
            {/* derive display values from possible nested shapes */}
            <Text style={[styles.word, { color: colors.text.primary }]}>
              {item.word ||
                item.vocab?.word ||
                item.sub_root?.token ||
                "(không có word)"}
            </Text>
            <View
              style={[styles.tag, { backgroundColor: colors.primary.light }]}
            >
              <Text style={[styles.tagText, { color: colors.text.inverse }]}>
                {item.prefix || item.vocab?.prefix || ""}
              </Text>
            </View>
          </View>
          <Text style={[styles.phonetic, { color: colors.text.secondary }]}>
            {item.phonetic || item.vocab?.phonetic || ""}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.iconBtn}
          >
            <Icon
              name="edit"
              type="material"
              size={20}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              handleDelete(item.id || item.sub_root?.id || item.vocab?.id)
            }
            style={styles.iconBtn}
          >
            <Icon
              name="delete"
              type="material"
              size={20}
              color={colors.accent.red}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.elementsRow}>
        {([item.prefix, item.infix, item.postfix].filter(Boolean).length
          ? [item.prefix, item.infix, item.postfix]
          : [item.vocab?.prefix, item.vocab?.infix, item.vocab?.postfix]
        )
          .filter(Boolean)
          .map((el: string, idx: number) => (
            <View
              key={`${el}-${idx}`}
              style={[
                styles.elementPill,
                {
                  backgroundColor: colors.surface.secondary,
                  borderColor: colors.border.primary,
                },
              ]}
            >
              <Text
                style={[styles.elementText, { color: colors.text.primary }]}
              >
                {el}
              </Text>
            </View>
          ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary.main }]}>
            Quản lý Sub Vocab
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.primary }]}>
            Quản lý danh sách từ con và các thành phần
          </Text>
        </View>

        <View style={styles.controls}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm từ..."
            placeholderTextColor={colors.text.tertiary}
            style={[
              styles.search,
              {
                backgroundColor: colors.surface.secondary,
                borderColor: colors.border.primary,
                color: colors.text.primary,
              },
            ]}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary.main }]}
            onPress={handleAdd}
          >
            <Text style={{ color: colors.text.button, fontWeight: "600" }}>
              + Thêm từ con
            </Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <Text
            style={{
              color: colors.text.tertiary,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Đang tải dữ liệu...
          </Text>
        )}
        {error && (
          <Text
            style={{
              color: colors.accent?.red ?? "red",
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Lỗi khi tải dữ liệu:{" "}
            {(error as any)?.message || JSON.stringify(error)}
          </Text>
        )}

        <FlatList
          data={filtered}
          keyExtractor={(item, index) =>
            item.id || item.vocab?.id || item.sub_root?.id || String(index)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.text.tertiary }]}>
              Không có từ con
            </Text>
          }
        />
      </View>

      <SimpleEditModal
        visible={modalVisible}
        title={editing ? "Chỉnh sửa từ con" : "Thêm từ con"}
        fields={[
          { name: "word", label: "Từ con", placeholder: "vd: administer" },
          {
            name: "sub_root_id",
            label: "Sub Root ID",
            placeholder: "vd: 1234",
            options: (subRootsData || []).map((v: any) => ({
              label: v.token,
              value: v.id,
            })),
          },
          { name: "prefix", label: "Tiền tố", placeholder: "vd: ad" },
          { name: "infix", label: "Trung tố", placeholder: "vd: mi" },
          { name: "postfix", label: "Hậu tố", placeholder: "vd: ion" },
          { name: "phonetic", label: "Phiên âm", placeholder: "/.../" },
          { name: "prefix_meaning", label: "Nghĩa tiền tố" },
          { name: "infix_meaning", label: "Nghĩa trung tố" },
          { name: "postfix_meaning", label: "Nghĩa hậu tố" },
        ]}
        initialValues={editing || undefined}
        onSubmit={onSubmit}
        onCancel={() => setModalVisible(false)}
        submitText={editing ? "Cập nhật" : "Thêm"}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 120 },
  wrapper: { width: "90%", alignSelf: "center" },
  header: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10, paddingTop: 24 },
  subtitle: { fontSize: 14 },
  controls: { marginTop: 6, marginBottom: 12 },
  search: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  addBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  list: { paddingBottom: 24 },
  card: { borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1 },
  cardTop: { flexDirection: "row", justifyContent: "space-between" },
  wordRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  word: { fontSize: 18, fontWeight: "700", marginRight: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontWeight: "600", fontSize: 12, marginLeft: 0 },
  phonetic: { fontSize: 13 },
  actions: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  iconBtn: { marginLeft: 24 },
  elementsRow: { marginTop: 10, flexDirection: "row", flexWrap: "wrap" },
  elementPill: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
  },
  elementText: { fontWeight: "600" },
  empty: { textAlign: "center", marginTop: 24 },
});
