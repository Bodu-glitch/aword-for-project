import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
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
  useListVocabSubRootsQuery,
  useUpsertVocabSubRootMutation,
  useDeleteVocabSubRootMutation,
  useListVocabQuery,
} from "@/lib/features/admin/adminApi";
import SimpleEditModal from "@/components/SimpleEditModal";
import sanitizeUpsert from "@/utls/sanitizeUpsert";

export default function SubRootsPage() {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const { data: subRoots = [] } = useListVocabSubRootsQuery({});
  const { data: vocabData } = useListVocabQuery({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [upsertSubRoot] = useUpsertVocabSubRootMutation();
  const [deleteSubRoot] = useDeleteVocabSubRootMutation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return subRoots;
    return (subRoots || []).filter((item: any) => {
      const token = (item.token || "").toString().toLowerCase();
      const def = (item.defination || "").toString().toLowerCase();
      return token.includes(q) || def.includes(q);
    });
  }, [subRoots, query]);

  const handleAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setModalVisible(true);
  };
  const handleDelete = async (id: string) => {
    await deleteSubRoot({ id }).unwrap();
  };

  const onSubmit = async (values: any) => {
    const payload = sanitizeUpsert(values);
    await upsertSubRoot(payload as any).unwrap();
    setModalVisible(false);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary.main }]}>
            Quản lý Gốc từ con
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.primary }]}>
            Tạo/chỉnh sửa/xóa gốc từ con
          </Text>
        </View>

        <View style={styles.controls}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm gốc từ..."
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
              + Thêm gốc từ con
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
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
                <Text style={[styles.token, { color: colors.text.primary }]}>
                  {item.token}
                </Text>
                <View style={styles.actions}>
                  <TouchableOpacity
                    onPress={() => handleEdit(item)}
                    style={styles.iconBtn}
                  >
                    <Icon
                      name="edit"
                      type="material"
                      size={20}
                      color={colors.accent.blue}
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
              <Text style={[styles.def, { color: colors.text.secondary }]}>
                {item.defination}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.text.tertiary }]}>
              Không có gốc từ con
            </Text>
          }
        />
      </View>

      <SimpleEditModal
        visible={modalVisible}
        title={editing ? "Chỉnh sửa gốc từ con" : "Thêm gốc từ con"}
        fields={[
          {
            name: "vocab_id",
            label: "Gốc từ cha",
            options: (vocabData || []).map((v: any) => ({
              label: v.word,
              value: v.id,
            })),
          },
          { name: "token", label: "Token", placeholder: "vd: adminis" },
          { name: "defination", label: "Nghĩa gốc con", placeholder: "Nghĩa" },
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
  list: { paddingBottom: 24 },
  card: { borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  token: { fontSize: 18, fontWeight: "700" },
  def: { fontSize: 13, marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center", marginRight: 16 },
  iconBtn: { marginLeft: 24 },
  empty: { textAlign: "center", marginTop: 24 },
  search: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
});
