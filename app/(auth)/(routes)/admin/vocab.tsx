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
    word: "dictionary",
    tag: "dict",
    phonetic: "/ˈdɪkʃənəri/",
    elements: ["ary"],
  },
  {
    id: "2",
    word: "inspect",
    tag: "spec",
    phonetic: "/ɪnˈspekt/",
    elements: ["in"],
  },
];

const VocabPage = () => {
  const [query, setQuery] = useState("");
  const [data, setData] = useState(initialData);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.word.toLowerCase().includes(q) ||
        (item.elements || []).some((el) => el.toLowerCase().includes(q))
    );
  }, [query, data]);

  const handleDelete = (id: string) => {
    setData((prev) => prev.filter((i) => i.id !== id));
  };

  const handleEdit = (id: string) => {
    // placeholder: navigate to edit screen or open modal
    console.log("Edit", id);
  };

  const renderItem = ({ item }: { item: (typeof initialData)[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View>
          {/* word và tag cùng hàng */}
          <View style={styles.wordRow}>
            <Text style={styles.word}>{item.word}</Text>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{item.tag}</Text>
            </View>
          </View>
          {/* phiên âm xuống hàng dưới */}
          <Text style={styles.phonetic}>{item.phonetic}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleEdit(item.id)}
            style={styles.iconBtn}
          >
            <Icon name="edit" type="material" size={20} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.iconBtn}
          >
            <Icon name="delete" type="material" size={20} color="#ff0000ff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.elementsRow}>
        {(item.elements || []).map((el) => (
          <View key={el} style={styles.elementPill}>
            <Text style={styles.elementText}>{el}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* wrapper để căn lề 90% màn hình */}
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Quản lý Từ vựng</Text>
          <Text style={styles.subtitle}>
            Quản lý danh sách từ vựng và các thành phần
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Thêm từ vựng</Text>
          </TouchableOpacity>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm theo từ hoặc gốc từ..."
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
          ListEmptyComponent={<Text style={styles.empty}>Không có từ nào</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

export default VocabPage;

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
    marginBottom: 8,
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
    color: "#ffffffff",
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
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  word: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8, 
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tag: {
    backgroundColor: "#1a47cfff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    color: "#fbfbfbff",
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 0,
  },
  phonetic: {
    color: "#ffffffff",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  iconBtn: {
    marginLeft: 24,
  },
  iconText: {
    fontSize: 18,
  },
  elementsRow: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  elementPill: {
    backgroundColor: "#0d777cff",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#107a5aff",
  },
  elementText: {
    color: "#00ffb3ff",
    fontWeight: "600",
  },
  empty: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 24,
  },
});
