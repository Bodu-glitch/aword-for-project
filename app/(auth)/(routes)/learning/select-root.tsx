import React, { useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { Card } from "heroui-native";
import { useColorScheme } from "nativewind";
import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import {
  useFindProgressingRootQuery,
  useGetRootsQuery,
} from "@/lib/features/vocab/vocabApi";

const { width } = Dimensions.get("window");

function Index() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const { data: CHAPTERS } = useGetRootsQuery();
  const { data: isHaveProgressingRoot } = useFindProgressingRootQuery();

  function openSelectSession(chapterId: string) {
    // chuyển tới trang chọn session, kèm param chapter
    router.push(
      `/learning/select-session?chapter=${encodeURIComponent(chapterId)}`,
    );
  }

  useEffect(() => {
    if (isHaveProgressingRoot) {
      console.log("isHaveProgressingRoot", isHaveProgressingRoot);
      // replace current stack with the learning screen
      router.replace("/(auth)/(routes)/learning");
    }
  }, [isHaveProgressingRoot, router]);

  if (!CHAPTERS) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
        className={"bg-white dark:bg-gray-900"}
      >
        <Text style={{ color: colors.text.primary }}>Loading chapters...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      className={"bg-white dark:bg-gray-900"}
    >
      {/*<Card style={styles.progressCard}>*/}
      {/*  <View style={styles.progressRow}>*/}
      {/*    <Text style={styles.progressText}>Overall Progress</Text>*/}
      {/*    <Text style={[styles.progressCount, { color: colors.primary.main }]}>0/419 words</Text>*/}
      {/*  </View>*/}
      {/*  <View style={styles.progressBarBackground}>*/}
      {/*    <View style={[styles.progressBarFill, { width: "0%", backgroundColor: colors.primary.main }]} />*/}
      {/*  </View>*/}
      {/*</Card>*/}

      {CHAPTERS.map((c, index) => (
        <Pressable
          key={c.id}
          onPress={() => openSelectSession(c.id)}
          style={{ width: "100%", alignItems: "center" }}
        >
          <Card style={styles.card}>
            <View style={styles.row}>
              <View
                style={[
                  styles.circle,
                  { backgroundColor: colors.primary.main },
                ]}
              >
                <Text style={styles.circleText}>{index + 1}</Text>
              </View>

              <View style={styles.content}>
                <View style={styles.titleRow}>
                  <Text style={styles.chapterTitle}>Chapter {index + 1} </Text>
                  <Text
                    style={[styles.keyword, { color: colors.primary.main }]}
                  >
                    {c.root_code}
                  </Text>
                </View>

                {/*<Text style={styles.desc}>{c.}</Text>*/}
                <Text style={styles.words}>{c.word_count} words</Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={22}
                color={colors.primary.main}
                style={{ flex: 0 }}
              />
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Card style={styles.progressCard}>
//         <View style={styles.progressRow}>
//           <Text style={styles.progressText}>Overall Progress</Text>
//           <Text style={styles.progressCount}>0/419 words</Text>
//         </View>
//         <View style={styles.progressBarBackground}>
//           <View style={[styles.progressBarFill, { width: "0%" }]} />
//         </View>
//       </Card>
//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>1</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 1: </Text>
//                 <Text style={styles.keyword}>ad-</Text>
//               </View>
//               <Text style={styles.desc}>hướng đến (ai), tác động vào (ai)</Text>
//               <Text style={styles.words}>36 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>2</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 2: </Text>
//                 <Text style={styles.keyword}>con-, com-, co-</Text>
//               </View>
//               <Text style={styles.desc}>(cùng)</Text>
//               <Text style={styles.words}>42 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>3</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 3: </Text>
//                 <Text style={styles.keyword}>de-</Text>
//               </View>
//               <Text style={styles.desc}>(rời khỏi/chia tách, bên dưới)</Text>
//               <Text style={styles.words}>38 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>4</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 4: </Text>
//                 <Text style={styles.keyword}>sub-</Text>
//               </View>
//               <Text style={styles.desc}>(phía dưới)</Text>
//               <Text style={styles.words}>31 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>5</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 5: </Text>
//                 <Text style={styles.keyword}>sur-, super-</Text>
//               </View>
//               <Text style={styles.desc}>(hướng lên trên, vượt)</Text>
//               <Text style={styles.words}>29 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>6</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 6: </Text>
//                 <Text style={styles.keyword}>ex-</Text>
//               </View>
//               <Text style={styles.desc}>(ngoài/ngoại trừ)</Text>
//               <Text style={styles.words}>44 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>7</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 7: </Text>
//                 <Text style={styles.keyword}>pro-, pre-, for-</Text>
//               </View>
//               <Text style={styles.desc}>(hướng lên trước/trước)</Text>
//               <Text style={styles.words}>47 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>8</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 8: </Text>
//                 <Text style={styles.keyword}>re-</Text>
//               </View>
//               <Text style={styles.desc}>
//                 (lại/quay lại từ đầu, quay lại đằng sau)
//               </Text>
//               <Text style={styles.words}>52 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>9</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 9: </Text>
//                 <Text style={styles.keyword}>in-, im-, en-</Text>
//               </View>
//               <Text style={styles.desc}>(hướng vào trong, hướng lên trên)</Text>
//               <Text style={styles.words}>39 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>11</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 11: </Text>
//                 <Text style={styles.keyword}>un-, im-, in-, a-</Text>
//               </View>
//               <Text style={styles.desc}>(phủ định)</Text>
//               <Text style={styles.words}>33 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>

//       <Link href={"/flashcard/learn"} asChild>
//         <Card style={styles.card}>
//           <View style={styles.row}>
//             <View
//               style={[styles.circle, { backgroundColor: colors.primary.main }]}
//             >
//               <Text style={styles.circleText}>12</Text>
//             </View>
//             <View style={styles.content}>
//               <View style={styles.titleRow}>
//                 <Text style={styles.chapterTitle}>Chapter 12: </Text>
//                 <Text style={styles.keyword}>
//                   mono-, uni-, bi-, du-, tri-, multi-
//                 </Text>
//               </View>
//               <Text style={styles.desc}>(chỉ số lượng)</Text>
//               <Text style={styles.words}>28 words</Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={22}
//               color={colors.primary.main}
//             />
//           </View>
//         </Card>
//       </Link>
//     </ScrollView>
//   );
// }

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // justifyContent: "center",
    paddingVertical: 16,
    alignItems: "center",
  },

  progressCard: {
    width: width * 0.95,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: 16,
    elevation: 2,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    color: "#2a4cf3",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressCount: {
    color: "#2a4cf3",
    fontSize: 14,
    fontWeight: "bold",
  },
  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "white",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#fffefeff",
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "#2a4cf3",
    borderRadius: 4,
  },

  card: {
    width: width * 0.95,
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 2,
    padding: 16,
    marginVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  circleText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  chapterTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  keyword: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#2a4cf3",
    flexShrink: 1,
  },
  desc: {
    color: "#666",
    fontSize: 14,
    marginBottom: 2,
  },
  words: {
    color: "#bbb",
    fontSize: 12,
  },
});

export default Index;
