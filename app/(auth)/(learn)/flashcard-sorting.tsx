import { Vocabulary } from "@/models/Vocabulary";
import { getTotalVocabularyCount } from "@/supabase/vocabulary";
import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getPartOfSpeechFull = (pos: string): string => {
  const posLower = pos.toLowerCase();
  switch (posLower) {
    case "n":
      return "noun";
    case "v":
      return "verb";
    case "adj":
      return "adjective";
    case "adv":
      return "adverb";
    case "pron":
      return "pronoun";
    case "prep":
      return "preposition";
    case "conj":
      return "conjunction";
    case "interj":
      return "interjection";
    case "det":
      return "determiner";
    case "aux":
      return "auxiliary";
    default:
      return posLower;
  }
};

const highlightWordInExample = (example: string, word: string, colors: any) => {
  if (!example || !word) return example;
  const regex = new RegExp(
    `(\\b${word.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b)`,
    "gi"
  );
  const parts = example.split(regex);
  if (parts.length === 1) return example;
  return parts.map((part, index) => {
    if (regex.test(part) && index % 2 === 1) {
      return (
        <Text
          key={index}
          style={{ fontWeight: "bold", color: colors.accent.blue }}
        >
          {part}
        </Text>
      );
    }
    return part;
  });
};

type Props = {
  seedHistory: Vocabulary[];
  onExitSorting?: () => void;
};

const FlashcardSorting = ({ seedHistory, onExitSorting }: Props) => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [knownCount, setKnownCount] = useState<number>(0);
  const [dontKnowCount, setDontKnowCount] = useState<number>(0);
  const [knownIds, setKnownIds] = useState<Set<string>>(new Set());
  const [dontKnowIds, setDontKnowIds] = useState<Set<string>>(new Set());
  const [sortingComplete, setSortingComplete] = useState<boolean>(false);
  const [totalCardsInDB, setTotalCardsInDB] = useState<number>(0);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [originalHistory, setOriginalHistory] = useState<Vocabulary[]>([]);
  const [headerWidth, setHeaderWidth] = useState<number | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const flipAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setHistory(seedHistory);
    setOriginalHistory(seedHistory);
    setCurrentIndex(0);
    setCurrentWord(seedHistory[0] || null);
    setLoading(false);
  }, [seedHistory]);

  useEffect(() => {
    (async () => {
      const total = await getTotalVocabularyCount();
      setTotalCardsInDB(total);
    })();
  }, []);

  const flipCard = () => {
    Animated.spring(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      tension: 10,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });
  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }] };

  const handleSortingChoice = (isKnown: boolean) => {
    if (!currentWord) return;
    if (isKnown) {
      setKnownCount((c) => c + 1);
      setKnownIds((prev) => new Set(prev).add(currentWord.id));
      setDontKnowIds((prev) => {
        const next = new Set(prev);
        next.delete(currentWord.id);
        return next;
      });
    } else {
      setDontKnowCount((c) => c + 1);
      setDontKnowIds((prev) => new Set(prev).add(currentWord.id));
      setKnownIds((prev) => {
        const next = new Set(prev);
        next.delete(currentWord.id);
        return next;
      });
    }

    if (currentIndex >= history.length - 1) {
      setSortingComplete(true);
      return;
    }
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setCurrentWord(history[newIndex]);
    setIsFlipped(false);
  };

  const keepReviewingDontKnow = () => {
    if (dontKnowIds.size === 0) return;
    const filtered = history.filter((h) => dontKnowIds.has(h.id));
    if (filtered.length === 0) return;
    setHistory(filtered);
    setCurrentIndex(0);
    setCurrentWord(filtered[0]);
    setKnownCount(0);
    setDontKnowCount(0);
    setKnownIds(new Set());
    setDontKnowIds(new Set());
    setSortingComplete(false);
    setIsFlipped(false);
  };

  const shuffleVocabulary = () => {
    if (history.length === 0) return;

    console.log(
      "Shuffle clicked - knownCount:",
      knownCount,
      "dontKnowCount:",
      dontKnowCount
    );

    // Check if user has made any choices
    if (knownCount > 0 || dontKnowCount > 0) {
      console.log("Showing shuffle dialog");
      Alert.alert(
        "Shuffle Cards",
        "Shuffling will reset all your Know/Don't Know choices. Are you sure you want to continue?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => console.log("Shuffle cancelled"),
          },
          {
            text: "Shuffle",
            style: "destructive",
            onPress: () => {
              console.log("Shuffle confirmed");
              handleShuffleConfirm();
            },
          },
        ]
      );
      return;
    }

    console.log("Performing shuffle directly");
    performShuffle();
  };

  const performShuffle = () => {
    if (isShuffled) {
      // If already shuffled, restore original order
      setHistory(originalHistory);
      setCurrentIndex(0);
      setCurrentWord(originalHistory[0]);
      flipAnimation.setValue(0);
      setIsFlipped(false);
      setIsShuffled(false);
    } else {
      // Shuffle the current history
      const shuffled = [...history].sort(() => Math.random() - 0.5);
      setHistory(shuffled);
      setCurrentIndex(0);
      setCurrentWord(shuffled[0]);
      flipAnimation.setValue(0);
      setIsFlipped(false);
      setIsShuffled(true);
    }
  };

  const handleShuffleConfirm = () => {
    // Reset all progress when shuffling
    setKnownCount(0);
    setDontKnowCount(0);
    setKnownIds(new Set());
    setDontKnowIds(new Set());
    setSortingComplete(false);
    performShuffle();
  };

  const toggleStar = () => {
    if (!currentWord) return;
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentWord.id)) next.delete(currentWord.id);
      else next.add(currentWord.id);
      return next;
    });
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background.primary }}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text className="mt-4" style={{ color: colors.text.secondary }}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      {!sortingComplete && (
        <View className="px-6 -mt-2 mb-4">
          <View
            className="w-full h-2 rounded-full"
            style={{ backgroundColor: colors.background.secondary }}
          >
            <View
              className="h-2 rounded-full"
              style={{
                width:
                  totalCardsInDB > 0
                    ? `${Math.min(((currentIndex + 1) / totalCardsInDB) * 100, 100)}%`
                    : "0%",
                backgroundColor: colors.primary.main,
              }}
            />
          </View>

          {/* Count Display */}
          <View className="flex-row items-center justify-between mt-3">
            <View className="flex-row items-center">
              <View
                className="px-4 py-1 rounded-full mr-2"
                style={{
                  backgroundColor: colors.background.secondary,
                  borderWidth: 2,
                  borderColor: colors.accent.red,
                  minWidth: 48,
                }}
              >
                <Text
                  className="text-xl font-bold text-center"
                  style={{ color: colors.accent.red }}
                >
                  {dontKnowCount}
                </Text>
              </View>
              <Text
                className="text-lg font-medium"
                style={{ color: colors.accent.red }}
              >
                Don't Know
              </Text>
            </View>

            <View className="flex-row items-center">
              <Text
                className="text-lg font-medium mr-2"
                style={{ color: colors.accent.green }}
              >
                Know
              </Text>
              <View
                className="px-4 py-1 rounded-full"
                style={{
                  backgroundColor: colors.background.secondary,
                  borderWidth: 2,
                  borderColor: colors.accent.green,
                  minWidth: 48,
                }}
              >
                <Text
                  className="text-xl font-bold text-center"
                  style={{ color: colors.accent.green }}
                >
                  {knownCount}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {sortingComplete ? (
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-full items-center">
            {/* Progress Circle and Stats */}
            <View className="flex-row items-center justify-between w-full mb-8">
              {/* Left side - Progress Circle */}
              <View className="items-center justify-center">
                <View
                  className="w-32 h-32 rounded-full items-center justify-center"
                  style={{
                    borderWidth: 12,
                    borderColor: colors.accent.green,
                    backgroundColor: colors.background.secondary,
                  }}
                >
                  <Text
                    className="text-4xl font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    {history.length > 0
                      ? Math.round((knownCount / history.length) * 100)
                      : 0}
                    %
                  </Text>
                </View>
              </View>

              {/* Right side - Know/Don't Know counts */}
              <View className="flex-1 ml-8">
                <View className="flex-row items-center justify-between mb-4">
                  <Text
                    className="text-xl font-medium"
                    style={{ color: colors.accent.green }}
                  >
                    Know
                  </Text>
                  <View
                    className="px-6 py-2 rounded-full"
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderWidth: 2,
                      borderColor: colors.accent.green,
                      minWidth: 64,
                    }}
                  >
                    <Text
                      className="text-xl font-bold text-center"
                      style={{ color: colors.accent.green }}
                    >
                      {knownCount}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text
                    className="text-xl font-medium"
                    style={{ color: colors.accent.red }}
                  >
                    Don't Know
                  </Text>
                  <View
                    className="px-6 py-2 rounded-full"
                    style={{
                      backgroundColor: colors.background.secondary,
                      borderWidth: 2,
                      borderColor: colors.accent.red,
                      minWidth: 64,
                    }}
                  >
                    <Text
                      className="text-xl font-bold text-center"
                      style={{ color: colors.accent.red }}
                    >
                      {dontKnowCount}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="w-full">
              {dontKnowCount > 0 && (
                <Pressable
                  onPress={keepReviewingDontKnow}
                  className="rounded-2xl items-center justify-center py-4 w-full mb-3"
                  style={{ backgroundColor: colors.accent.green }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.text.button }}
                  >
                    Keep reviewing {dontKnowCount} terms
                  </Text>
                </Pressable>
              )}

              <Pressable
                onPress={() => {
                  setHistory(seedHistory);
                  setCurrentIndex(0);
                  setCurrentWord(seedHistory[0] || null);
                  setKnownCount(0);
                  setDontKnowCount(0);
                  setKnownIds(new Set());
                  setDontKnowIds(new Set());
                  setSortingComplete(false);
                  setIsFlipped(false);
                }}
                className="rounded-2xl items-center justify-center py-4 w-full mb-3"
                style={{ borderWidth: 2, borderColor: colors.text.secondary }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  Restart flashcards
                </Text>
              </Pressable>

              {onExitSorting && (
                <Pressable
                  onPress={onExitSorting}
                  className="rounded-2xl items-center justify-center py-4 w-full"
                  style={{ backgroundColor: colors.primary.main }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.text.button }}
                  >
                    Back to Normal Mode
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-1 justify-center items-center px-6">
          {/* Touch overlay for flipping card */}
          <Pressable
            className="absolute inset-0 z-10"
            onPress={flipCard}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
            }}
          />

          <View className="relative w-full flex-1 max-h-[400px] min-h-[300px]">
            <Animated.View
              style={[
                {
                  position: "absolute",
                  backfaceVisibility: "hidden",
                  width: "100%",
                },
                frontAnimatedStyle,
              ]}
            >
              <View
                className="rounded-2xl shadow-lg justify-center items-center self-center w-full h-full"
                style={{
                  padding: 24,
                  backgroundColor: colors.background.secondary,
                  shadowColor: colors.text.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: colors.accent.blue,
                }}
              >
                <Pressable
                  className="absolute top-4 right-4 z-20"
                  onPress={toggleStar}
                  style={{ zIndex: 20 }}
                >
                  <Ionicons
                    name={
                      currentWord && starredIds.has(currentWord.id)
                        ? "star"
                        : "star-outline"
                    }
                    size={22}
                    color={colors.accent.yellow}
                  />
                </Pressable>

                <View
                  className="flex-row items-center justify-center mb-4"
                  onLayout={(e) => setHeaderWidth(e.nativeEvent.layout.width)}
                >
                  <Text
                    className="text-5xl font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    {currentWord?.word}
                  </Text>
                </View>

                <View
                  className="h-1"
                  style={{ width: headerWidth ?? undefined }}
                >
                  <View className="flex-row justify-between">
                    {[...Array(8)].map((_, i) => (
                      <View
                        key={i}
                        className="w-4 h-1 rounded-full"
                        style={{ backgroundColor: colors.accent.yellow }}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              style={[
                {
                  position: "absolute",
                  backfaceVisibility: "hidden",
                  width: "100%",
                },
                backAnimatedStyle,
              ]}
            >
              <View
                className="rounded-2xl shadow-lg justify-center self-center w-full h-full"
                style={{
                  padding: 24,
                  backgroundColor: colors.background.secondary,
                  shadowColor: colors.text.primary,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 4,
                  elevation: 4,
                  borderWidth: 1,
                  borderColor: colors.accent.blue,
                }}
              >
                {/* Refresh Button */}
                <Pressable
                  className="absolute top-4 right-4 z-20"
                  onPress={() => {
                    setHistory(seedHistory);
                    setCurrentIndex(0);
                    setCurrentWord(seedHistory[0] || null);
                    setKnownCount(0);
                    setDontKnowCount(0);
                    setKnownIds(new Set());
                    setDontKnowIds(new Set());
                    setSortingComplete(false);
                    setIsFlipped(false);
                  }}
                  style={{ zIndex: 20 }}
                >
                  <Ionicons
                    name="refresh"
                    size={20}
                    color={colors.text.secondary}
                  />
                </Pressable>

                {/* Word with Syllables and POS */}
                <View className="flex-row items-center mb-2">
                  <View className="flex-row items-center">
                    {currentWord?.prefix && (
                      <>
                        <Text
                          className="text-lg font-semibold"
                          style={{ color: colors.accent.red }}
                        >
                          {currentWord.prefix}
                        </Text>
                        <Text
                          className="text-sm mx-1"
                          style={{ color: colors.text.secondary }}
                        >
                          •
                        </Text>
                      </>
                    )}
                    <Text
                      className="text-lg font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      {currentWord?.word
                        ?.replace(currentWord?.prefix || "", "")
                        .replace(currentWord?.postfix || "", "") || "word"}
                    </Text>
                    {currentWord?.postfix && (
                      <>
                        <Text
                          className="text-sm mx-1"
                          style={{ color: colors.text.secondary }}
                        >
                          •
                        </Text>
                        <Text
                          className="text-lg font-semibold"
                          style={{ color: colors.accent.green }}
                        >
                          {currentWord.postfix}
                        </Text>
                      </>
                    )}
                  </View>
                  <Text
                    className="text-sm ml-4 mr-2"
                    style={{ color: colors.text.secondary }}
                  >
                    {getPartOfSpeechFull(currentWord?.pos || "")}
                  </Text>
                  <Pressable className="ml-1 z-20" style={{ zIndex: 20 }}>
                    <Ionicons
                      name="volume-high"
                      size={16}
                      color={colors.text.secondary}
                    />
                  </Pressable>
                </View>

                {/* Pronunciation */}
                <Text
                  className="text-base mb-3"
                  style={{ color: colors.text.secondary }}
                >
                  {currentWord?.ipa}
                </Text>

                {/* Translation */}
                <Text
                  className="text-xl font-medium mb-3"
                  style={{ color: colors.text.primary }}
                >
                  {currentWord?.definition_vi}
                </Text>

                {/* Example */}
                <Text
                  className="text-base mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  {highlightWordInExample(
                    currentWord?.example_en || "",
                    currentWord?.word || "",
                    colors
                  )}
                </Text>

                {/* Example Vietnamese */}
                {currentWord?.example_vi && (
                  <Text
                    className="text-base mb-6"
                    style={{ color: colors.text.secondary }}
                  >
                    {currentWord.example_vi}
                  </Text>
                )}

                {/* Anatomy Section */}
                <View>
                  <Text
                    className="font-bold text-lg mb-3"
                    style={{ color: colors.text.primary }}
                  >
                    Anatomy
                  </Text>

                  {/* Prefix */}
                  {currentWord?.prefix && (
                    <View className="flex-row items-center mb-2">
                      <View className="flex-row items-center w-40">
                        <View
                          className="rounded-l-full px-3 py-1 w-[60px]"
                          style={{ backgroundColor: colors.accent.red }}
                        >
                          <Text className="text-white text-xs font-medium text-center">
                            Prefix
                          </Text>
                        </View>
                        <Text
                          className="ml-3 text-base font-semibold"
                          style={{ color: colors.text.primary }}
                        >
                          {currentWord.prefix}-
                        </Text>
                      </View>
                      <Text
                        className="flex-1 ml-8 text-base text-left"
                        style={{ color: colors.text.secondary }}
                      >
                        {currentWord.prefix_meaning}
                      </Text>
                    </View>
                  )}

                  {/* Infix */}
                  {currentWord?.infix && (
                    <View className="flex-row items-center mb-2">
                      <View className="flex-row items-center w-40">
                        <View
                          className="rounded-l-full px-3 py-1 w-[60px]"
                          style={{ backgroundColor: colors.accent.purple }}
                        >
                          <Text className="text-white text-xs font-medium text-center">
                            Infix
                          </Text>
                        </View>
                        <Text
                          className="ml-3 text-base font-semibold"
                          style={{ color: colors.text.primary }}
                        >
                          -{currentWord.infix}-
                        </Text>
                      </View>
                      <Text
                        className="flex-1 ml-8 text-base text-left"
                        style={{ color: colors.text.secondary }}
                      >
                        {currentWord.infix_meaning}
                      </Text>
                    </View>
                  )}

                  {/* Postfix */}
                  {currentWord?.postfix && (
                    <View className="flex-row items-center">
                      <View className="flex-row items-center w-40">
                        <View
                          className="rounded-l-full px-3 py-1 w-[60px]"
                          style={{ backgroundColor: colors.accent.green }}
                        >
                          <Text className="text-white text-xs font-medium text-center">
                            Postfix
                          </Text>
                        </View>
                        <Text
                          className="ml-3 text-base font-semibold"
                          style={{ color: colors.text.primary }}
                        >
                          -{currentWord.postfix}
                        </Text>
                      </View>
                      <Text
                        className="flex-1 ml-8 text-base text-left"
                        style={{ color: colors.text.secondary }}
                      >
                        {currentWord.postfix_meaning}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Animated.View>
          </View>

          <View
            className="w-full mt-6 flex-row items-center justify-between z-20"
            style={{ zIndex: 20 }}
          >
            <Pressable
              onPress={onExitSorting}
              className="rounded-full px-3 py-2 z-20"
              style={{
                backgroundColor: colors.primary.main,
                zIndex: 20,
              }}
            >
              <Ionicons name="funnel" size={20} color={colors.text.button} />
            </Pressable>

            <View className="flex-row items-center z-20" style={{ zIndex: 20 }}>
              <Pressable
                onPress={() => handleSortingChoice(false)}
                className="rounded-full px-4 py-2 mr-3 border-2 z-20"
                style={{
                  backgroundColor: "transparent",
                  borderColor: colors.accent.red,
                  zIndex: 20,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons name="close" size={18} color={colors.accent.red} />
                </View>
              </Pressable>

              <Text
                className="text-base mx-1"
                style={{ color: colors.text.secondary }}
              >
                {Math.max(currentIndex + 1, 0)} / {history.length || 0}
              </Text>

              <Pressable
                onPress={() => handleSortingChoice(true)}
                className="rounded-full px-4 py-2 ml-3 border-2 z-20"
                style={{
                  backgroundColor: "transparent",
                  borderColor: colors.accent.green,
                  zIndex: 20,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.accent.green}
                  />
                </View>
              </Pressable>
            </View>

            <Pressable
              onPress={shuffleVocabulary}
              className="rounded-full px-3 py-2 z-20"
              style={{
                backgroundColor: isShuffled
                  ? colors.accent.blue
                  : colors.background.secondary,
                zIndex: 20,
              }}
            >
              <Ionicons
                name="shuffle"
                size={20}
                color={isShuffled ? colors.text.button : colors.text.secondary}
              />
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default FlashcardSorting;
