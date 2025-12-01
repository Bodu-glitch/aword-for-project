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
    tag: "dictionary",
    pos: "noun",
    definition:
      "A book or electronic resource that lists the words of a language and gives their meaning",
    date: "25/11/2025",
  },
  {
    id: "2",
    tag: "inspect",
    pos: "verb",
    definition:
      "To look at something carefully in order to learn more about it",
    date: "25/11/2025",
  },
  {
    id: "3",
    tag: "port",
    pos: "verb",
    definition: "To carry or move something from one place to another",
    date: "25/11/2025",
  },
];

const Page = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(initialData);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.tag.toLowerCase().includes(q) ||
        item.pos.toLowerCase().includes(q) ||
        item.definition.toLowerCase().includes(q)
    );
  }, [query, data]);

  const handleDelete = (id: string) =>
    setData((prev) => prev.filter((i) => i.id !== id));
  const handleEdit = (id: string) => console.log("Edit sense", id);
  const moveUp = (id: string) => console.log("Move up", id);
  const moveDown = (id: string) => console.log("Move down", id);

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof initialData)[0];
    index: number;
  }) => (
    <View style={styles.card}>
      {/* Row top: index + tag + pos ; up/down/edit/delete on right (all inline & spaced) */}
      <View style={styles.rowTop}>
        <View style={styles.rowTopLeft}>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>#{index + 1}</Text>
          </View>
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
          <View style={styles.posPill}>
            <Text style={styles.posText}>{item.pos}</Text>
          </View>
        </View>

        <View style={styles.rowTopRight}>
          <TouchableOpacity
            onPress={() => moveUp(item.id)}
            style={styles.iconBtn}
          >
            <Icon
              name="arrow-upward"
              type="material"
              size={20}
              color="#8eaefc"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => moveDown(item.id)}
            style={styles.iconBtn}
          >
            <Icon
              name="arrow-downward"
              type="material"
              size={20}
              color="#8eaefc"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleEdit(item.id)}
            style={styles.iconBtn}
          >
            <Icon name="edit" type="material" size={20} color="#ffd36b" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.iconBtn}
          >
            <Icon name="delete" type="material" size={20} color="#ff6b6b" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Definition full width below */}
      <Text style={styles.definitionText}>{item.definition}</Text>

      <Text style={styles.dateText}>{item.date}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Quản lý Nghĩa từ</Text>
          <Text style={styles.subtitle}>Quản lý các nghĩa và loại từ vựng</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Thêm nghĩa</Text>
          </TouchableOpacity>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm theo từ hoặc định nghĩa..."
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
          ListEmptyComponent={
            <Text style={styles.empty}>Không có nghĩa nào</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#071526",
    paddingHorizontal: 16,
    paddingTop: 120,
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
    borderColor: "#2b3a45",
  },

  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rowTopLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  indexBadge: {
    backgroundColor: "#16232b",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#23313a",
  },
  indexText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  tagPill: {
    backgroundColor: "#2f6df6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  posPill: {
    backgroundColor: "#2b8a59",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  posText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  rowTopRight: {
    flexDirection: "row",
    alignItems: "center",
    width: 140,
    justifyContent: "space-between",
  },

  definitionText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
    paddingTop: 6,
  },

  iconBtn: {
    marginLeft: 0,
  },

  dateText: {
    color: "#8fa3b6",
    fontSize: 12,
    marginTop: 6,
  },

  label: {
    color: "#94a3b8",
    fontSize: 13,
    marginBottom: 6,
  },

  empty: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 24,
  },
});
