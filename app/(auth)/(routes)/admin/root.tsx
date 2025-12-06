import React, { useState, useMemo, useEffect, useRef } from "react";
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
import {
  useListRootsQuery,
  useUpsertRootMutation,
  useDeleteRootMutation,
} from "@/lib/features/admin/adminApi";

const RootPage = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [query, setQuery] = useState("");
  // Don't assume fixed item height — let FlatList measure items naturally
  // server data/hooks
  const { data: data = [], isLoading, error } = useListRootsQuery({});
  const [upsertRoot] = useUpsertRootMutation();
  const [deleteRoot] = useDeleteRootMutation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return (data || []).filter((item: any) => {
      const code = (item.root_code || "") as string;
      const meaning = (item.root_meaning || "") as string;
      return (
        code.toLowerCase().includes(q) || meaning.toLowerCase().includes(q)
      );
    });
  }, [query, data]);

  // Debug logs to verify counts and visible items
  useEffect(() => {
    console.log(
      "[RootPage] total data.length:",
      Array.isArray(data) ? data.length : typeof data,
    );
    console.log(
      "[RootPage] filtered.length:",
      Array.isArray(filtered) ? filtered.length : typeof filtered,
    );
    try {
      if (Array.isArray(data) && data.length > 0) {
        console.log(
          "[RootPage] first id:",
          data[0]?.id,
          "last id:",
          data[data.length - 1]?.id,
        );
      }
    } catch (e) {
      console.debug("RootPage id debug error", e);
    }
  }, [data, filtered]);

  const viewableRef = useRef<any>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteRoot({ id }).unwrap();
    } catch (e) {
      console.error("deleteRoot failed", e);
    }
  };
  const handleEdit = (item: any) => {
    setEditing(item);
    setModalVisible(true);
  };
  const handleAdd = () => {
    setEditing(null);
    setModalVisible(true);
  };
  const onSubmit = (values: any) => {
    (async () => {
      try {
        await upsertRoot(values as any).unwrap();
      } catch (e) {
        console.error("upsertRoot failed", e);
      } finally {
        setModalVisible(false);
      }
    })();
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
      {/* rowTop: tag (left) and icons (right) */}
      <View style={styles.rowTop}>
        <View
          style={[styles.tagPill, { backgroundColor: colors.primary.light }]}
        >
          <Text style={[styles.tagPillText, { color: colors.text.inverse }]}>
            {item.root_code ?? item.tag}
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
        {item.root_meaning ?? item.meaning}
      </Text>

      {/* date as third row */}
      <Text style={[styles.dateText, { color: colors.text.tertiary }]}>
        {item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
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

        {isLoading ? (
          <Text
            style={{
              color: colors.text.tertiary,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            Đang tải dữ liệu...
          </Text>
        ) : error ? (
          <Text
            style={{
              color: colors.accent?.red ?? "red",
              textAlign: "center",
              marginTop: 12,
            }}
          >
            Lỗi khi tải dữ liệu:{" "}
            {(error as any)?.message ?? JSON.stringify(error)}
          </Text>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item, index) =>
              item && item.id ? String(item.id) : `idx-${index}`
            }
            renderItem={renderItem}
            contentContainerStyle={[styles.list, { flexGrow: 1 }]}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: colors.text.tertiary }]}>
                Không có gốc từ
              </Text>
            }
            style={{ flex: 1 }}
            // render window tuning (conservative values so FlatList measures items)
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={11}
            removeClippedSubviews={false}
            onViewableItemsChanged={({ viewableItems }) => {
              try {
                const indices = viewableItems.map((v: any) => v.index);
                viewableRef.current = indices;
              } catch (err) {
                console.debug("viewableItems error", err);
              }
            }}
            viewabilityConfig={{ itemVisiblePercentThreshold: 10 }}
          />
        )}
      </View>

      <SimpleEditModal
        visible={modalVisible}
        title={editing ? "Chỉnh sửa gốc từ" : "Thêm gốc từ"}
        fields={[
          { name: "root_code", label: "Mã gốc", placeholder: "vd: dict" },
          {
            name: "root_meaning",
            label: "Nghĩa gốc",
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
  wrapper: { width: "90%", alignSelf: "center", flex: 1 },
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
