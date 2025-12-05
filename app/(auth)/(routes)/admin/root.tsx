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
import SimpleEditModal from "@/components/SimpleEditModal";

const initialData = [
  {
    id: "1",
    tag: "dict",
    root: "dict",
    meaning: "nói, nói ra",
    date: "25/11/2025",
  },
  {
    id: "2",
    tag: "spec",
    root: "spec",
    meaning: "nhìn, quan sát",
    date: "25/11/2025",
  },
  {
    id: "3",
    tag: "port",
    root: "port",
    meaning: "mang, vận chuyển",
    date: "25/11/2025",
  },
  { id: "4", tag: "scrib", root: "scrib", meaning: "viết", date: "25/11/2025" },
  {
    id: "5",
    tag: "duct",
    root: "duct",
    meaning: "dẫn, dắt",
    date: "25/11/2025",
  },
];

const RootPage = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [query, setQuery] = useState("");
  const [data, setData] = useState(initialData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<null | (typeof initialData)[0]>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.tag.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.root.toLowerCase().includes(q),
    );
  }, [query, data]);

  const handleDelete = (id: string) =>
    setData((prev) => prev.filter((i) => i.id !== id));
  const handleEdit = (item: (typeof initialData)[0]) => {
    setEditing(item);
    setModalVisible(true);
  };
  const handleAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };
  const onSubmit = (values: any) => {
    if (editing) {
      setData((prev) =>
        prev.map((i) => (i.id === editing.id ? { ...i, ...values } : i)),
      );
    } else {
      const newRow = {
        id: String(Date.now()),
        tag: values.tag || "",
        root: values.root || values.tag || "",
        meaning: values.meaning || "",
        date: new Date().toISOString().slice(0, 10),
      } as (typeof initialData)[0];
      setData((prev) => [newRow, ...prev]);
    }
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: (typeof initialData)[0] }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.primary,
          borderColor: colors.border.primary,
        },
      ]}
    >
      {/* rowTop: tag (left) and icons (right) */}
      <View style={styles.rowTop}>
        <View
          style={[styles.tagPill, { backgroundColor: colors.primary.light }]}
        >
          <Text style={[styles.tagPillText, { color: colors.text.inverse }]}>
            {item.tag}
          </Text>
        </View>

        <View style={styles.iconRow}>
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

      {/* meaning as second row */}
      <Text style={[styles.meaningText, { color: colors.text.primary }]}>
        {item.meaning}
      </Text>

      {/* date as third row */}
      <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
        {item.date}
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
            Quản lý Gốc từ
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.primary }]}>
            Quản lý danh sách các gốc từ và ý nghĩa
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary.main }]}
            onPress={handleAdd}
          >
            <Text style={[styles.addBtnText, { color: colors.text.button }]}>
              + Thêm gốc từ
            </Text>
          </TouchableOpacity>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm theo mã gốc hoặc nghĩa..."
            placeholderTextColor={colors.text.tertiary}
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.surface.secondary,
                borderColor: colors.border.primary,
                color: colors.text.primary,
              },
            ]}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.text.tertiary }]}>
              Không có gốc từ
            </Text>
          }
        />
      </View>

      <SimpleEditModal
        visible={modalVisible}
        title={editing ? "Chỉnh sửa gốc từ" : "Thêm gốc từ"}
        fields={[
          { name: "tag", label: "Mã gốc", placeholder: "vd: dict" },
          { name: "root", label: "Gốc", placeholder: "vd: dict" },
          {
            name: "meaning",
            label: "Ý nghĩa",
            placeholder: "vd: nói, nói ra",
            multiline: true,
          },
        ]}
        initialValues={editing || undefined}
        onSubmit={onSubmit}
        onCancel={() => setModalVisible(false)}
        submitText={editing ? "Cập nhật" : "Thêm"}
      />
    </SafeAreaView>
  );
};

export default RootPage;

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
  addBtnText: { fontWeight: "600" },
  searchInput: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  list: { paddingBottom: 24 },
  card: { borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconRow: { flexDirection: "row", alignItems: "center" },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  tagPillText: { fontWeight: "700", fontSize: 12 },
  meaningText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 6,
  },
  dateText: { fontSize: 12, marginTop: 6 },
  iconBtn: { marginLeft: 20, marginRight: 12 },
  empty: { textAlign: "center", marginTop: 24 },
});
