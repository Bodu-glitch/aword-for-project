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
  useListProfilesQuery,
  useDeleteProfileMutation,
  useBanProfileMutation,
} from "@/lib/features/admin/adminApi";

export default function UsersPage() {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const { data: users = [] } = useListProfilesQuery();
  const [deleteProfile] = useDeleteProfileMutation();
  const [banProfile] = useBanProfileMutation();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return users;
    return (users || []).filter((u: any) => {
      const name = (u.full_name || "").toString().toLowerCase();
      const email = (u.email || "").toString().toLowerCase();
      const id = (u.id || "").toString().toLowerCase();
      return name.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [users, query]);

  const handleDelete = async (id: string) => {
    await deleteProfile({ id }).unwrap();
  };
  const toggleBan = async (id: string, banned: boolean) => {
    await banProfile({ id, banned }).unwrap();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary.main }]}>
            Quản lý User
          </Text>
          <Text style={[styles.subtitle, { color: colors.text.primary }]}>
            Xóa và cấm người dùng
          </Text>
        </View>

        <View style={styles.controlsRow}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm user..."
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
              <View style={styles.rowTop}>
                <View style={styles.left}>
                  <Text style={[styles.name, { color: colors.text.primary }]}>
                    {item.full_name || item.email || item.id}
                  </Text>
                </View>
                <View style={styles.actions}>
                  {/*<TouchableOpacity*/}
                  {/*  onPress={() => toggleBan(item.id, true)}*/}
                  {/*  style={styles.iconBtn}*/}
                  {/*>*/}
                  {/*  <Icon*/}
                  {/*    name="block"*/}
                  {/*    type="material"*/}
                  {/*    size={20}*/}
                  {/*    color={colors.accent.red}*/}
                  {/*  />*/}
                  {/*</TouchableOpacity>*/}

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
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: colors.text.tertiary }]}>
              Không có user
            </Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  wrapper: { width: "90%", alignSelf: "center" },
  header: { marginBottom: 12, paddingTop: 8 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 10, paddingTop: 24 },
  subtitle: { fontSize: 14 },
  list: { paddingBottom: 24 },
  card: { borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1 },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  name: { fontSize: 16, fontWeight: "700", marginRight: 8 },
  actions: { flexDirection: "row", alignItems: "center" },
  iconBtn: { marginLeft: 20 },
  empty: { textAlign: "center", marginTop: 24 },
  controlsRow: { marginBottom: 12 },
  search: {
    width: "100%",
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
});
