import PlayAudioButton from "@/components/PlayAudioButton";
import { Vocabulary } from "@/models/Vocabulary";
import {
  fetchRandomVocabularyBatch,
  fetchVocabularyBatch,
} from "@/supabase/vocabulary";
import { getColors } from "@/utls/colors";
import { getPartOfSpeechFull } from "@/utls/get_part_of_speechfull";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  StatusBar,
  View,
  Touchable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Tooltip from "react-native-walkthrough-tooltip";

const { width } = Dimensions.get("window");

const highlightWordInExample = (example: string, word: string, colors: any) => {
  if (!example || !word) return example;
  const regex = new RegExp(
    `(\\b${word.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\b)`,
    "gi",
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
  onEnterSortingMode?: (vocabularyData: Vocabulary[]) => void;
};

const FlashcardNormal = ({ onEnterSortingMode }: Props) => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const [isFlipped, setIsFlipped] = useState(false);
  const [currentWord, setCurrentWord] = useState<Vocabulary | null>(null);
  const [loading, setLoading] = useState(true);
  const [headerWidth, setHeaderWidth] = useState<number | null>(null);
  const [history, setHistory] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [totalCardsInDB, setTotalCardsInDB] = useState<number>(0);

  // New state for batch loading and caching
  const [vocabularyCache, setVocabularyCache] = useState<Vocabulary[]>([]);
  const [originalVocabularyCache, setOriginalVocabularyCache] = useState<
    Vocabulary[]
  >([]);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);
  const [isShuffled, setIsShuffled] = useState<boolean>(false);

  const BATCH_SIZE = 30;

  const flipAnimation = useRef(new Animated.Value(0)).current;

  // Load initial batch of vocabulary
  const loadVocabularyBatch = async (shuffle: boolean = false) => {
    let total = 0;
    try {
      setLoading(true);
      let batch: Vocabulary[];

      if (shuffle) {
        console.log("loadVocabularyBatch - fetching random batch");
        batch = await fetchRandomVocabularyBatch(BATCH_SIZE);
      } else {
        batch = await fetchVocabularyBatch(
          currentBatchIndex * BATCH_SIZE,
          BATCH_SIZE,
        );
      }
      total = batch.length;

      console.log("loadVocabularyBatch - fetched batch of size:", batch);

      if (batch.length > 0) {
        setVocabularyCache(batch);
        setOriginalVocabularyCache(batch);
        setHistory(batch);
        setCurrentIndex(0);
        setCurrentWord(batch[0]);
        setIsFlipped(false);

        if (!shuffle) {
          setCurrentBatchIndex((prev) => prev + 1);
        }
      } else {
        setCurrentWord(null);
      }
    } catch (error) {
      console.error("Error loading vocabulary batch:", error);
      setCurrentWord(null);
    } finally {
      setLoading(false);
    }
    return total;
  };

  // Shuffle current vocabulary cache
  const shuffleVocabulary = () => {
    if (vocabularyCache.length === 0) return;

    if (isShuffled) {
      // If already shuffled, restore original order
      setVocabularyCache(originalVocabularyCache);
      setHistory(originalVocabularyCache);
      setCurrentIndex(0);
      setCurrentWord(originalVocabularyCache[0]);
      flipAnimation.setValue(0);
      setIsFlipped(false);
      setIsShuffled(false);
    } else {
      // Shuffle the current cache
      const shuffled = [...vocabularyCache].sort(() => Math.random() - 0.5);
      setVocabularyCache(shuffled);
      setHistory(shuffled);
      setCurrentIndex(0);
      setCurrentWord(shuffled[0]);
      flipAnimation.setValue(0);
      setIsFlipped(false);
      setIsShuffled(true);
    }
  };

  // Load next batch when needed
  const loadNextBatch = async () => {
    if (isShuffled) {
      // If shuffled, load a new random batch
      await loadVocabularyBatch(true);
    } else {
      // If not shuffled, load next sequential batch
      const nextBatch = await fetchVocabularyBatch(
        currentBatchIndex * BATCH_SIZE,
        BATCH_SIZE,
      );
      if (nextBatch.length > 0) {
        const newCache = [...vocabularyCache, ...nextBatch];
        setVocabularyCache(newCache);
        setOriginalVocabularyCache(newCache);
        setHistory(newCache);
        setCurrentBatchIndex((prev) => prev + 1);
      }
    }
  };

  useEffect(() => {
    (async () => {
      const total = await loadVocabularyBatch();

      setTotalCardsInDB(total);
    })();
  }, []);

  useEffect(() => {
    if (currentWord) {
      // 1. Dừng mọi chuyển động
      flipAnimation.stopAnimation();

      // 2. Reset giá trị về 0 (Mặt trước)
      flipAnimation.setValue(0);

      // 3. Đảm bảo state React khớp với giao diện
      setIsFlipped(false);
      Animated.spring(flipAnimation, {
        toValue: 0,
        tension: 10,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  }, [currentWord]);

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

  const handlePrevious = () => {
    console.log(
      "handlePrevious - history.length:",
      history.length,
      "currentIndex:",
      currentIndex,
    );
    if (history.length === 0 || currentIndex < 0) {
      console.log("handlePrevious - early return");
      return;
    }
    const newIndex = currentIndex > 0 ? currentIndex - 1 : history.length - 1;
    console.log("handlePrevious - newIndex:", newIndex);

    // Reset flip animation to front side
    setIsFlipped(false);

    flipAnimation.setValue(0);

    setCurrentIndex(newIndex);
    setCurrentWord(history[newIndex]);
  };

  const handleNext = () => {
    if (history.length === 0 || currentIndex < 0) {
      return;
    }

    flipAnimation.stopAnimation();

    setIsFlipped(false);

    // Reset flip animation to front side
    flipAnimation.setValue(0);

    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCurrentWord(history[newIndex]);
      return;
    }

    // At the end of current batch, load next batch
    if (vocabularyCache.length < totalCardsInDB) {
      loadNextBatch();
      return;
    }

    // All cards fetched, loop back to start
    setCurrentIndex(0);
    setCurrentWord(history[0]);
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

  const toggleSortingMode = () => {
    // Entering sorting mode - navigate to FlashcardSorting
    if (onEnterSortingMode && originalVocabularyCache.length > 0) {
      onEnterSortingMode(originalVocabularyCache);
    }
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
            Loading vocabulary...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentWord) {
    return (
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background.primary }}
      >
        <View className="flex-1 justify-center items-center px-6">
          <Text
            className="text-xl font-semibold text-center mb-4"
            style={{ color: colors.text.primary }}
          >
            No vocabulary available
          </Text>
          <Text
            className="text-base text-center mb-6"
            style={{ color: colors.text.secondary }}
          >
            Please check your internet connection or try again later.
          </Text>
          <Pressable
            onPress={() => loadVocabularyBatch()}
            className="rounded-2xl items-center justify-center py-4 px-8"
            style={{ backgroundColor: colors.primary.main }}
          >
            <Text
              className="text-base font-semibold"
              style={{ color: colors.text.button }}
            >
              Retry
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      <View className="px-6 -mt-2 mb-2">
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
      </View>

      <Pressable
        onPress={() => {
          console.log("Flashcard pressed");
          flipCard();
        }}
        className={"flex-1"}
      >
        <View className="flex-1 justify-center items-start px-6 ">
          <View className="relative w-full flex-1 max-h-[500px] min-h-[400px]">
            <Animated.View
              pointerEvents={isFlipped ? "none" : "box-none"}
              style={[
                {
                  position: "absolute",
                  backfaceVisibility: "hidden",
                  width: "100%",
                  zIndex: isFlipped ? 1 : 2,
                },
                frontAnimatedStyle,
              ]}
            >
              <View
                key={`front-${currentWord.id}`}
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
                {/*<Pressable*/}
                {/*  className="absolute top-4 right-4 z-20"*/}
                {/*  onPress={toggleStar}*/}
                {/*  style={{ zIndex: 20 }}*/}
                {/*>*/}
                {/*  <Ionicons*/}
                {/*    name={*/}
                {/*      currentWord && starredIds.has(currentWord.id)*/}
                {/*        ? "star"*/}
                {/*        : "star-outline"*/}
                {/*    }*/}
                {/*    size={22}*/}
                {/*    color={colors.accent.yellow}*/}
                {/*  />*/}
                {/*</Pressable>*/}
                {(() => {
                  const parts = [
                    {
                      type: "prefix",
                      word: currentWord.prefix,
                      meaning: currentWord.prefix_meaning,
                    },
                    {
                      type: "infix",
                      word: currentWord.infix,
                      meaning: currentWord.infix_meaning,
                    },
                    {
                      type: "postfix",
                      word: currentWord.postfix,
                      meaning: currentWord.postfix_meaning,
                    },
                  ].filter((p) => p.word); // Lọc bỏ những phần không có từ (null/undefined/empty)

                  return (
                    <View className="flex flex-row items-center justify-center border-gray-500 w-full flex-wrap">
                      {parts.map((part, index) => (
                        <React.Fragment key={`${currentWord.id}-${part.type}`}>
                          {/* Render từ */}
                          <WordTooltip
                            word={part.word!} // Dấu ! vì ta đã filter ở trên
                            meaning={part.meaning || "No meaning"}
                            setHeaderWidth={setHeaderWidth}
                          />

                          {/* Render dấu chấm NẾU không phải là phần tử cuối cùng */}
                          {index < parts.length - 1 && (
                            <Text
                              className="text-lg mx-2 font-bold"
                              style={{ color: colors.accent.yellow }} // Hoặc colors.text.secondary tuỳ bạn thích
                            >
                              •
                            </Text>
                          )}
                        </React.Fragment>
                      ))}
                    </View>
                  );
                })()}
                {/*<View*/}
                {/*  className="h-1"*/}
                {/*  style={{ width: headerWidth ?? undefined }}*/}
                {/*>*/}
                {/*  <View className="flex-row justify-between">*/}
                {/*    {[...Array(currentWord.word.length)].map((_, i) => (*/}
                {/*      <View*/}
                {/*        key={i}*/}
                {/*        className="w-4 h-1 rounded-full"*/}
                {/*        style={{ backgroundColor: colors.accent.yellow }}*/}
                {/*      />*/}
                {/*    ))}*/}
                {/*  </View>*/}
                {/*</View>*/}
              </View>
            </Animated.View>

            {/* Back Side */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  backfaceVisibility: "hidden",
                  width: "100%",
                  zIndex: isFlipped ? 2 : 1,
                },
                backAnimatedStyle,
              ]}
            >
              <View
                className="rounded-2xl relative shadow-lg justify-center self-center w-full h-full"
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
                  onPress={() => loadVocabularyBatch()}
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
                    {getPartOfSpeechFull(currentWord.pos ?? "")}
                  </Text>
                  <PlayAudioButton
                    audioPath={currentWord.audio_path || ""}
                  ></PlayAudioButton>
                </View>

                {/* Pronunciation */}
                <Text
                  className="text-base mb-3"
                  style={{ color: colors.text.secondary }}
                >
                  {currentWord.phonetic}
                </Text>

                {/* Translation */}
                <Text
                  className="text-xl font-medium mb-3"
                  style={{ color: colors.text.primary }}
                >
                  {currentWord.definition_vi}
                </Text>

                {/* Example */}
                <Text
                  className="text-base mb-2"
                  style={{ color: colors.text.secondary }}
                >
                  {highlightWordInExample(
                    currentWord.example_en ?? "",
                    currentWord.word,
                    colors,
                  )}
                </Text>

                {/* Example Vietnamese */}
                {currentWord.example_vi && (
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
                  {currentWord.prefix && (
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
                  {currentWord.infix && (
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
                  {currentWord.postfix && (
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
            className="w-full mt-4 flex-row items-center justify-between z-20"
            style={{ zIndex: 20 }}
          >
            <Pressable
              onPress={toggleSortingMode}
              className="rounded-full px-3 py-2 z-20"
              style={{
                backgroundColor: colors.background.secondary,
                zIndex: 20,
              }}
            >
              <Ionicons name="funnel" size={20} color={colors.text.secondary} />
            </Pressable>

            <View className="flex-row items-center z-20" style={{ zIndex: 20 }}>
              <Pressable
                onPress={handlePrevious}
                className="rounded-full px-4 py-2 mr-3 border-2 z-20"
                style={{
                  backgroundColor: colors.primary.main,
                  borderColor: "transparent",
                  opacity: 1,
                  zIndex: 20,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={colors.text.button}
                  />
                </View>
              </Pressable>

              <Text
                className="text-base mx-1"
                style={{ color: colors.text.secondary }}
              >
                {Math.max(currentIndex + 1, 0)} / {totalCardsInDB || 0}
              </Text>

              <Pressable
                onPress={handleNext}
                className="rounded-full px-4 py-2 ml-3 border-2 z-20"
                style={{
                  backgroundColor: colors.primary.main,
                  borderColor: "transparent",
                  opacity: 1,
                  zIndex: 20,
                }}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.text.button}
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
      </Pressable>
    </SafeAreaView>
  );
};

const WordTooltip = ({
  word,
  meaning,
  setHeaderWidth,
}: {
  word: string;
  meaning: string;
  setHeaderWidth: (width: number) => void;
}) => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Tooltip
      isVisible={isVisible}
      content={
        <View>
          <Text> {meaning} </Text>
        </View>
      }
      onClose={() => setIsVisible(false)}
      backgroundColor={"transparent"}
      placement="bottom"
      // below is for the status bar of react navigation bar
      topAdjustment={
        Platform.OS === "android" ? -(StatusBar.currentHeight ?? 0) : 0
      }
    >
      <Pressable
        className=""
        onLayout={(e: any) => setHeaderWidth(e.nativeEvent.layout.width)}
        onPress={(event) => {
          event.preventDefault();
          setIsVisible(true);
        }}
      >
        <Text
          className="text-5xl font-bold"
          style={{ color: colors.text.primary }}
        >
          {word}
        </Text>
        {/*<View className="h-1" style={{ width: headerWidth ?? undefined }}>*/}
        {/*  <View className="flex-row ">*/}
        {/*    {[...Array(word.length)].map((_, i) => (*/}
        {/*      <View*/}
        {/*        key={i}*/}
        {/*        className="w-4 h-1 rounded-full"*/}
        {/*        style={{ backgroundColor: colors.accent.yellow }}*/}
        {/*      />*/}
        {/*    ))}*/}
        {/*  </View>*/}
        {/*</View>*/}
      </Pressable>
    </Tooltip>
  );
};

export default FlashcardNormal;
