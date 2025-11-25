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
import { Link } from "expo-router";

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
  const [query, setQuery] = useState("");
  const [data, setData] = useState(initialData);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.tag.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.root.toLowerCase().includes(q)
    );
  }, [query, data]);

  const handleDelete = (id: string) =>
    setData((prev) => prev.filter((i) => i.id !== id));
  const handleEdit = (id: string) => console.log("Edit root", id);

  const renderItem = ({ item }: { item: (typeof initialData)[0] }) => (
    <View style={styles.card}>
      {/* rowTop: tag (left) and icons (right) */}
      <View style={styles.rowTop}>
        <View style={styles.tagPill}>
          <Text style={styles.tagPillText}>{item.tag}</Text>
        </View>

        <View style={styles.iconRow}>
          <TouchableOpacity
            onPress={() => handleEdit(item.id)}
            style={styles.iconBtn}
          >
            <Icon name="edit" type="material" size={20} color="#a8d1ff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.iconBtn}
          >
            <Icon name="delete" type="material" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* meaning as second row */}
      <Text style={styles.meaningText}>{item.meaning}</Text>

      {/* date as third row */}
      <Text style={styles.dateText}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Quản lý Gốc từ</Text>
          <Text style={styles.subtitle}>
            Quản lý danh sách các gốc từ và ý nghĩa
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Thêm gốc từ</Text>
          </TouchableOpacity>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm theo mã gốc hoặc nghĩa..."
            placeholderTextColor="#97a0b3"
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.empty}>Không có gốc từ</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

export default RootPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071526",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  wrapper: {
    width: "90%",
    alignSelf: "center",
  },
  header: {
    marginBottom: 12,
    paddingTop: 8,
  },
  title: {
    color: "#3867f4ff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
    paddingTop: 24,
  },
  subtitle: {
    color: "#ffffffff",
    fontSize: 14,
  },
  controls: {
    marginTop: 6,
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: "#2b6ef6",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  searchInput: {
    backgroundColor: "#0b1320",
    borderColor: "#223043",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    color: "#e6f0ff",
  },
  list: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: "#0f1a24",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#22343d",
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagPill: {
    backgroundColor: "#2f6df6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 12,
  },
  tagPillText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  meaningText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 6,
  },
  dateText: {
    color: "#8fa3b6",
    fontSize: 12,
    marginTop: 6,
  },
  iconBtn: {
    marginLeft: 20,
    marginRight: 12,
  },
  empty: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 24,
  },
});
