import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Link } from "expo-router";
import { useColorScheme } from "nativewind";
import { getColors } from "@/utls/colors";
import {
  useListRootsQuery,
  useListVocabQuery,
  useListSensesQuery,
  useListExamplesQuery,
  useListSubVocabQuery,
  useListVocabSubRootsQuery,
  useListProfilesQuery,
} from "@/lib/features/admin/adminApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = Math.round(SCREEN_WIDTH * 0.9);

export default function AdminHome() {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const { data: roots } = useListRootsQuery();
  const { data: vocabs } = useListVocabQuery({});
  const { data: senses } = useListSensesQuery({});
  const { data: examples } = useListExamplesQuery({});
  const { data: subVocabs } = useListSubVocabQuery({});
  const { data: subRoots } = useListVocabSubRootsQuery({});
  const { data: subSenses } = useListSensesQuery({});
  const { data: subExamples } = useListExamplesQuery({});
  const { data: user } = useListProfilesQuery({});

  const Card = ({
    href,
    title,
    desc,
    count,
  }: {
    href: React.ComponentProps<typeof Link>["href"];
    title: string;
    desc: string;
    count?: number;
  }) => (
    <Link href={href} asChild>
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.surface.primary,
            borderColor: colors.border.primary,
          },
        ]}
      >
        <Text style={[styles.cardTitle, { color: colors.text.primary }]}>
          {title}
        </Text>
        <Text style={[styles.cardDesc, { color: colors.text.secondary }]}>
          {desc}
        </Text>
        {typeof count === "number" && (
          <View
            style={[styles.badge, { backgroundColor: colors.primary.light }]}
          >
            <Text style={{ color: colors.text.inverse, fontWeight: "700" }}>
              {count}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Link>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background.primary }]}
    >
      <View style={styles.wrapper}>
        <Text style={[styles.title, { color: colors.primary.main }]}>
          Bảng điều khiển Admin
        </Text>
        <Text style={[styles.subtitle, { color: colors.text.primary }]}>
          Quản lý dữ liệu từ vựng và người dùng
        </Text>

        <View style={styles.grid}>
          <Card
            href="/admin/root"
            title="Gốc từ"
            desc="Quản lý các gốc từ"
            count={roots?.length}
          />
          <Card
            href="/admin/vocab"
            title="Từ vựng"
            desc="Quản lý từ vựng"
            count={vocabs?.length}
          />
          <Card
            href="/admin/vocab_senses"
            title="Nghĩa từ"
            desc="Quản lý nghĩa theo loại từ"
            count={senses?.length}
          />
          <Card
            href="/admin/vocab_examples"
            title="Ví dụ"
            desc="Quản lý câu ví dụ"
            count={examples?.length}
          />
          <Card
            href="/admin/users"
            title="Người dùng"
            desc="Quản lý người dùng"
            count={user?.length}
          />
          <Card
            href="/admin/sub_vocab"
            title="Từ con"
            desc="Quản lý sub vocab"
            count={subVocabs?.length}
          />
          <Card
            href="/admin/sub_roots"
            title="Gốc từ con"
            desc="Quản lý vocab sub roots"
            count={subRoots?.length}
          />
          <Card
            href="/admin/sub_vocab_senses"
            title="Nghĩa từ con"
            desc="Quản lý nghĩa của sub vocab"
            count={subSenses?.length}
          />
          <Card
            href="/admin/sub_vocab_examples"
            title="Ví dụ từ con"
            desc="Quản lý ví dụ của sub vocab"
            count={subExamples?.length}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 24 },
  wrapper: { width: "90%", alignSelf: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6, paddingTop: 24 },
  subtitle: { fontSize: 14, marginBottom: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { borderWidth: 1, borderRadius: 10, padding: 14, width: "48%" },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDesc: { fontSize: 13, marginTop: 4 },
  badge: {
    position: "absolute",
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
