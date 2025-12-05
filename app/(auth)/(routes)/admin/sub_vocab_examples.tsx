import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { Icon } from "react-native-elements";
import { useColorScheme } from "nativewind";
import { getColors } from "@/utls/colors";
import {
  useListSubVocabExamplesQuery,
  useUpsertSubVocabExampleMutation,
  useDeleteSubVocabExampleMutation,
  useListSubVocabQuery,
} from "@/lib/features/admin/adminApi";
import SimpleEditModal from "@/components/SimpleEditModal";
import sanitizeUpsert from "@/utls/sanitizeUpsert";

export default function SubVocabExamplesPage() {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const { data: data = [] } = useListSubVocabExamplesQuery({});
  const { data: subVocabData } = useListSubVocabQuery({});
  const [upsertExample] = useUpsertSubVocabExampleMutation();
  const [deleteExample] = useDeleteSubVocabExampleMutation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return data;
    return (data || []).filter((it: any) => {
      const en = (it.example_en || "").toString().toLowerCase();
      const vi = (it.example_vi || "").toString().toLowerCase();
      return en.includes(q) || vi.includes(q);
    });
  }, [data, query]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const handleAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setModalVisible(true);
  };
  const handleDelete = async (id: string) => {
    await deleteExample({ id }).unwrap();
  };

  const onSubmit = async (values: any) => {
    const payload = sanitizeUpsert(values);
    await upsertExample(payload as any).unwrap();
    setModalVisible(false);
  };

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.primary,
          borderColor: colors.border.primary,
        },
      ]}
    >
      <View style={styles.rowTop}>
        <View style={styles.rowTopLeft}>
          <View
            style={[
              styles.indexBadge,
              {
                backgroundColor: colors.surface.secondary,
                borderColor: colors.border.primary,
              },
            ]}
          >
            <Text style={[styles.indexText, { color: colors.text.tertiary }]}>
              #{index + 1}
            </Text>
          </View>
        </View>
        <View style={styles.rowTopRight}>
          <TouchableOpacity
            onPress={() => handleEdit(item)}
            style={styles.iconBtn}
          >
            <Icon
              name="edit"
              type="material"
              size={20}
              color={colors.accent.yellow}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
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
      <Text style={[styles.label, { color: colors.text.tertiary }]}>
        English:
      </Text>
      <Text style={[styles.content, { color: colors.text.primary }]}>
        {item.example_en}
      </Text>
      <Text style={[styles.label, { color: colors.text.tertiary }]}>
        Tiếng Việt:
      </Text>
      <Text style={[styles.content, { color: colors.text.primary }]}>
        {item.example_vi}
      </Text>
    </View>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary.main }]}>
          Sub Vocab Examples
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.primary }]}>
          Quản lý ví dụ của sub vocab
        </Text>
      </View>
      <View style={styles.controls}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm ví dụ..."
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
            + Thêm ví dụ
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.text.tertiary }]}>
            Không có ví dụ
          </Text>
        }
      />
      <SimpleEditModal
        visible={modalVisible}
        title={editing ? "Chỉnh sửa ví dụ" : "Thêm ví dụ"}
        fields={[
          {
            name: "sub_vocab_id",
            label: "Sub Vocab ID",
            placeholder: "uuid của sub_vocab",
            options: (subVocabData || []).map((it: any) => ({
              label: it.word,
              value: it.id,
            })),
          },
          { name: "example_en", label: "Tiếng Anh" },
          { name: "example_vi", label: "Tiếng Việt" },
          { name: "example_order", label: "Thứ tự" },
        ]}
        initialValues={editing || undefined}
        onSubmit={onSubmit}
        onCancel={() => setModalVisible(false)}
        submitText={editing ? "Cập nhật" : "Thêm"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  wrapper: { width: "90%", alignSelf: "center" },
  header: { marginBottom: 12, paddingTop: 8 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10, paddingTop: 24 },
  subtitle: { fontSize: 14 },
  controls: { marginTop: 6, marginBottom: 12 },
  addBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  search: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  list: { paddingBottom: 24 },
  card: { borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rowTopLeft: { flexDirection: "row", alignItems: "center" },
  indexBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  indexText: { fontSize: 12, fontWeight: "700" },
  rowTopRight: { flexDirection: "row", alignItems: "center", paddingRight: 12 },
  iconBtn: { marginLeft: 20 },
  label: { fontSize: 13, marginBottom: 6 },
  content: { fontSize: 15, marginBottom: 10, lineHeight: 20 },
  empty: { textAlign: "center", marginTop: 24 },
});
