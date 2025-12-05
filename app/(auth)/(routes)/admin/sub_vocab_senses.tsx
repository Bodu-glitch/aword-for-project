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
  useListSubVocabSensesQuery,
  useUpsertSubVocabSenseMutation,
  useDeleteSubVocabSenseMutation,
  useListSubVocabQuery,
} from "@/lib/features/admin/adminApi";
import SimpleEditModal from "@/components/SimpleEditModal";
import sanitizeUpsert from "@/utls/sanitizeUpsert";

export default function SubVocabSensesPage() {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const { data: data = [] } = useListSubVocabSensesQuery({});
  const { data: subVocabData } = useListSubVocabQuery({});
  const [upsertSense] = useUpsertSubVocabSenseMutation();
  const [deleteSense] = useDeleteSubVocabSenseMutation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return data;
    return (data || []).filter((it: any) => {
      const def = (it.definition || "").toString().toLowerCase();
      const pos = (it.pos || "").toString().toLowerCase();
      return def.includes(q) || pos.includes(q);
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
    await deleteSense({ id }).unwrap();
  };

  const onSubmit = async (values: any) => {
    const payload = sanitizeUpsert(values);
    await upsertSense(payload as any).unwrap();
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
              {item.word}
            </Text>
          </View>
          <View
            style={[styles.posPill, { backgroundColor: colors.accent.green }]}
          >
            <Text style={[styles.posText, { color: colors.text.inverse }]}>
              {item.pos}
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
      <Text style={[styles.definitionText, { color: colors.text.primary }]}>
        {item.definition}
      </Text>
      <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
        {item.created_at}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary.main }]}>
            Sub Vocab Senses
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.primary }]}>
            Quản lý nghĩa theo loại từ của sub vocab
          </Text>
        </View>
        <View style={styles.controls}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm nghĩa..."
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
              + Thêm nghĩa
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
              Không có nghĩa nào
            </Text>
          }
        />
      </View>

      <SimpleEditModal
        visible={modalVisible}
        title={editing ? "Chỉnh sửa nghĩa" : "Thêm nghĩa"}
        fields={[
          {
            name: "sub_vocab_id",
            label: "Sub Vocab ID",
            placeholder: "uuid của sub_vocab",
            options: (subVocabData || []).map((sv: any) => ({
              label: sv.word,
              value: sv.id,
            })),
          },
          { name: "word", label: "Từ" },
          { name: "pos", label: "Loại từ (n|v|adj|prep|adv|n pl)" },
          { name: "definition", label: "Nghĩa", multiline: true },
          { name: "sense_order", label: "Thứ tự" },
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
  posPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  posText: { fontSize: 12, fontWeight: "700" },
  definitionText: { fontSize: 15, marginBottom: 10, lineHeight: 20 },
  dateText: { fontSize: 12, marginTop: 6 },
  empty: { textAlign: "center", marginTop: 24 },
});
