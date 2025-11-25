import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Link } from "expo-router";
import { Book, FileText, List, Lightbulb } from "lucide-react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

const items = [
  {
    key: "vocab",
    title: "Quản lý Từ vựng",
    desc: "Thêm, sửa, xóa từ vựng",
    icon: Book,
    href: "/admin/vocab",
    total: 65,
    latest: "Hôm nay",
    color: "#4da6ff",
  },
  {
    key: "root",
    title: "Quản lý Gốc từ",
    desc: "Thêm, sửa, xóa gốc từ",
    icon: FileText,
    href: "/admin/root",
    total: 75,
    latest: "Hôm nay",
    color: "#b68bff",
  },
  {
    key: "examples",
    title: "Quản lý Ví dụ",
    desc: "Thêm, sửa, xóa ví dụ",
    icon: List,
    href: "/admin/vocab_examples",
    total: 107,
    latest: "Hôm nay",
    color: "#26d07b",
  },
  {
    key: "senses",
    title: "Quản lý Nghĩa",
    desc: "Thêm, sửa, xóa nghĩa từ",
    icon: Lightbulb,
    href: "/admin/vocab_senses",
    total: 98,
    latest: "Hôm nay",
    color: "#ff9a3c",
  },
];

const AdminIndex = () => {
  return (
    <ScrollView
      contentContainerStyle={[styles.container, { alignItems: "center" }]}
    >
      {items.map((it) => {
        const Icon = it.icon;
        return (
          // Wrap Link with a View so marginBottom is applied correctly
          <View key={it.key} style={{ marginBottom: 24 }}>
            <Link href={it.href}>
              <View style={[styles.card, { width: CARD_WIDTH }]}>
                {/* top */}
                <View style={styles.cardTop}>
                  <View
                    style={[styles.iconWrap, { backgroundColor: it.color }]}
                  >
                    <Icon color="#fff" width={22} height={22} />
                  </View>
                  <View style={styles.titleWrap}>
                    <Text style={styles.cardTitle}>{it.title}</Text>
                    <Text style={styles.cardDesc}>{it.desc}</Text>
                  </View>
                </View>

                {/* bottom */}
                <View style={styles.cardBottom}>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Tổng số</Text>
                    <Text style={styles.infoValue}>{it.total}</Text>
                  </View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Mới nhất</Text>
                    <Text style={styles.infoValue}>{it.latest}</Text>
                  </View>
                </View>
              </View>
            </Link>
          </View>
        );
      })}
    </ScrollView>
  );
};

export default AdminIndex;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
    backgroundColor: "#071526",
  },

  card: {
    backgroundColor: "#0f1a24",
    borderRadius: 12,
    padding: 16,
    // marginBottom removed — wrapper View now provides spacing
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#a6a6a6ff",
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },

  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  titleWrap: {
    flex: 1,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },

  cardDesc: {
    color: "#a8b3bf",
    fontSize: 13,
  },

  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoBox: {
    flex: 1,
    backgroundColor: "#16232b",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },

  infoLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 6,
  },

  infoValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
