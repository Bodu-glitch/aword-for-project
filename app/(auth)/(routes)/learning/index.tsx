import FlowPager from "@/components/FlowPager";
import NewWord from "@/components/NewWord";
import NewWordDetail from "@/components/NewWordDetail";
import QuizFourOptions from "@/components/QuizFourOptions";
import QuizResult from "@/components/QuizResult";
import {
  useGetNewWordQuery,
  useGetQuestionsQuery,
} from "@/lib/features/learn/learnApi";
import { useLazyGetProfileQuery } from "@/lib/features/profile/profileApi";
import {
  useLazyGetTotalLearnedVocabCountQuery,
  useUpdateVocabsProgressMutation,
  type QuestionResult,
} from "@/lib/features/vocab/vocabApi";
import { getColors } from "@/utls/colors";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";

const Index = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [step, setStep] = React.useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<(number | null)[]>([]);
  const [checked, setChecked] = React.useState<boolean[]>([]);
  // Lưu kết quả cho mỗi lần trả lời (bao gồm thời gian)
  const [questionResults, setQuestionResults] = React.useState<
    QuestionResult[]
  >([]);
  // Bắt đầu tính thời gian cho câu hiện tại
  const [questionStartMs, setQuestionStartMs] = React.useState<number>(
    Date.now(),
  );
  const [updateProgress, { isLoading: isUpdatingProgress }] =
    useUpdateVocabsProgressMutation();

  const [getProfile] = useLazyGetProfileQuery();
  const [getTotalLearnedVocabCount] = useLazyGetTotalLearnedVocabCountQuery();

  // Tổng kết session
  const [expGained, setExpGained] = React.useState(0);
  const [totalTimeSec, setTotalTimeSec] = React.useState(0);
  const [maxStreak, setMaxStreak] = React.useState(0);

  // Hàng đợi câu hỏi để lặp lại câu sai
  const [questionQueue, setQuestionQueue] = React.useState<number[]>([]);

  // When the user presses Continue into the quiz but questions are still
  // loading, we store the intended step (`pendingStep`) and enable
  // `isAwaitingQuestions` to show the overlay. When questionsData arrives we
  // advance to the pending step automatically.
  const [pendingStep, setPendingStep] = React.useState<number | null>(null);
  const [isAwaitingQuestions, setIsAwaitingQuestions] = React.useState(false);

  const isFocused = useIsFocused();

  // Only fetch new words when the Learning tab/screen is focused.
  const { data: newWordsData, isLoading: isGettingNewWords } =
    useGetNewWordQuery(undefined, {
      skip: !isFocused,
      refetchOnMountOrArgChange: true,
    });

  // Fetch questions only when we have newWordsData and the screen is focused.
  const { data: questionsData, isLoading: isGettingQuestions } =
    useGetQuestionsQuery(newWordsData?.allSenses, {
      skip: !newWordsData || !isFocused,
    });

  React.useEffect(() => {
    console.log("questionsData", questionsData);
    if (questionsData?.questions) {
      setSelected(Array(questionsData.questions.length).fill(null));
      setChecked(Array(questionsData.questions.length).fill(false));
      setCurrentQuestionIndex(0);
      setQuestionResults([]);
      setQuestionStartMs(Date.now());
      // Khởi tạo hàng đợi: 0..n-1
      setQuestionQueue(questionsData.questions.map((_, i) => i));
      // If we were awaiting questions because the user pressed Continue to
      // enter the quiz, advance now.
      if (pendingStep !== null) {
        setStep(pendingStep);
        setPendingStep(null);
        setIsAwaitingQuestions(false);
      }
    }
  }, [questionsData]);

  // Đồng bộ chỉ số câu hiện tại theo phần tử đầu của hàng đợi
  React.useEffect(() => {
    if (questionQueue.length > 0) {
      setCurrentQuestionIndex(questionQueue[0]);
    }
  }, [questionQueue]);

  // Reset timer khi chuyển câu
  React.useEffect(() => {
    setQuestionStartMs(Date.now());
  }, [currentQuestionIndex]);
  React.useEffect(() => {
    console.log("newWordsData", newWordsData);
  }, [newWordsData]);

  const totalWords = newWordsData?.newWords?.length ?? 0;
  const quizStartIndex = totalWords * 2;

  // If we have new words and questions are still loading, block advancing into
  // the quiz page and keep the user on the last new-word page while showing the
  // overlay spinner.
  const shouldBlockAdvance =
    totalWords > 0 && isGettingQuestions && !questionsData;

  // Cap displayed index when blocking advance so the pager doesn't show the
  // quiz page while questions are still loading.
  const displayedIndex = shouldBlockAdvance
    ? Math.min(step, quizStartIndex - 1)
    : step;

  // Show initial loader only when we don't have any data yet or when we've
  // progressed past the new-word pages and questions are still loading.
  if (
    (isGettingNewWords && !newWordsData) ||
    (!isGettingNewWords &&
      newWordsData &&
      newWordsData.newWords.length === 0 &&
      isGettingQuestions &&
      !questionsData)
  ) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background.primary }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!questionsData && !isGettingQuestions) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background.primary }}
      >
        <Text className="text-lg" style={{ color: colors.text.primary }}>
          Failed to load questions. Please try again later.
        </Text>
      </View>
    );
  }

  const totalWordsCount = newWordsData?.newWords?.length ?? 0;
  const totalQuestions = questionsData?.questions?.length ?? 0;
  const totalUnits =
    totalWordsCount +
    (isGettingQuestions ? totalWordsCount * 2 : totalQuestions);
  const hasQuestions = totalQuestions > 0;

  // Progress helper: 0..1 theo tổng unit (words + mastered questions)
  const getUnitProgress = (unitIndex: number) =>
    totalUnits > 0 ? Math.max(0, Math.min(1, (unitIndex + 1) / totalUnits)) : 0;

  // Số câu đã master = tổng câu - số còn trong hàng đợi
  const masteredCount = Math.max(0, totalQuestions - questionQueue.length);
  const overallProgress =
    totalUnits > 0 ? (totalWordsCount + masteredCount) / totalUnits : 0;

  // Helper: format seconds as mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString();
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* When updating progress, keep the pager mounted to avoid unmounting which
          causes the pager to jump; show an absolute overlay spinner instead. */}
      {/* If we're blocking advance into the quiz while questions are loading,
          cap the displayed index so the pager doesn't show the quiz page even
          if `step` was set to move forward. */}
      <FlowPager index={displayedIndex}>
        {/* New words pages */}
        {newWordsData?.newWords?.map((word, idx) => [
          <NewWord
            key={`newword-${word.id}`}
            word={word.word}
            progress={getUnitProgress(idx)}
            onContinue={() => setStep(idx * 2 + 1)}
          />,
          <NewWordDetail
            key={`newworddetail-${word.id}`}
            progress={getUnitProgress(idx)}
            // Pass only the actual word parts (prefix/infix/postfix). The
            // NewWordDetail component will render a single mid-dot between
            // non-empty parts, so we don't need to inject dot placeholders here.
            wordParts={[
              { text: word.prefix && word.prefix !== "" ? word.prefix : null },
              { text: word.infix && word.infix !== "" ? word.infix : null },
              {
                text: word.postfix && word.postfix !== "" ? word.postfix : null,
              },
            ]}
            pos={word.vocab_senses[0]?.pos || ""}
            ipa={word.phonetic}
            viDefinition={word.vocab_senses[0]?.definition || ""}
            example={word.vocab_senses[0]?.word || ""}
            anatomy={[
              {
                badgeLabel: "Prefix",
                part: word.prefix,
                meaning: word.prefix_meaning,
              },
              {
                badgeLabel: "Origin",
                part: word.infix,
                meaning: word.infix_meaning,
              },
              {
                badgeLabel: "Postfix",
                part: word.postfix,
                meaning: word.postfix_meaning,
              },
            ]}
            onContinue={() => {
              const target = idx * 2 + 2;
              // If advancing would enter the quiz and questions are still
              // loading, set pendingStep and show overlay only after the user
              // pressed Continue. We'll advance automatically when
              // questionsData arrives.
              if (shouldBlockAdvance && target >= quizStartIndex) {
                setPendingStep(target);
                setIsAwaitingQuestions(true);
                return;
              }
              setStep(target);
            }}
            audioPath={word.audio_path}
          />,
        ])}

        {/* Quiz step: only render if there are questions */}
        {hasQuestions
          ? (() => {
              const q = questionsData!.questions[currentQuestionIndex];
              const opts = Array.isArray(q.answer_blocks)
                ? q.answer_blocks
                : [];
              const correctIndex = opts.findIndex(
                (opt) => opt === q.correct_answer,
              );
              // Replace !empty with a visual blank indicator
              const formattedQuestion = q.question.replace(/!empty/gi, "___");

              return (
                <QuizFourOptions
                  key={`quiz-${currentQuestionIndex}`}
                  progress={overallProgress}
                  title=""
                  prompt={formattedQuestion}
                  promptColorClass="text-red-600"
                  options={opts}
                  selectedIndex={selected[currentQuestionIndex]}
                  onSelect={(i) => {
                    const newSelected = [...selected];
                    newSelected[currentQuestionIndex] = i;
                    setSelected(newSelected);
                    if (checked[currentQuestionIndex]) {
                      const newChecked = [...checked];
                      newChecked[currentQuestionIndex] = false;
                      setChecked(newChecked);
                      setQuestionStartMs(Date.now());
                    }
                  }}
                  correctIndex={correctIndex}
                  checked={checked[currentQuestionIndex]}
                  onCheck={async () => {
                    if (!checked[currentQuestionIndex]) {
                      const newChecked = [...checked];
                      newChecked[currentQuestionIndex] = true;
                      setChecked(newChecked);

                      const userAnswerIndex = selected[currentQuestionIndex];
                      const userAnswer =
                        userAnswerIndex !== null &&
                        userAnswerIndex !== undefined
                          ? opts[userAnswerIndex]
                          : "";
                      const isCorrect = userAnswer === q.correct_answer;
                      const durationMs = Math.max(
                        0,
                        Date.now() - questionStartMs,
                      );
                      const durationSec = Math.max(
                        1,
                        Math.round(durationMs / 1000),
                      );

                      const newResult: QuestionResult = {
                        question: q.question,
                        userAnswer,
                        correctAnswer: q.correct_answer,
                        isCorrect,
                        vocabId: q.vocab_id,
                        durationSec,
                      };

                      setQuestionResults((prev) => [...prev, newResult]);
                    } else {
                      // Continue -> cập nhật hàng đợi
                      const userAnswerIndex = selected[currentQuestionIndex];
                      const userAnswer =
                        userAnswerIndex !== null &&
                        userAnswerIndex !== undefined
                          ? opts[userAnswerIndex]
                          : "";
                      const isCorrect = userAnswer === q.correct_answer;

                      setQuestionQueue((prev) => {
                        if (prev.length === 0) return prev;
                        const [head, ...rest] = prev;

                        // Clear trạng thái cho lần lặp lại
                        setChecked((c) => {
                          const cp = [...c];
                          cp[head] = false;
                          return cp;
                        });
                        setSelected((s) => {
                          const cp = [...s];
                          cp[head] = null;
                          return cp;
                        });

                        if (isCorrect) {
                          const newQueue = rest;
                          if (newQueue.length === 0) {
                            (async () => {
                              try {
                                const res = await updateProgress({
                                  questionResults,
                                  allWords: newWordsData
                                    ? newWordsData.allWords
                                    : [],
                                }).unwrap();
                                const total = questionResults.reduce(
                                  (sum, r) => sum + (r.durationSec || 0),
                                  0,
                                );
                                setTotalTimeSec(total);
                                setExpGained(res?.expGained ?? 0);
                                let curr = 0;
                                let best = 0;
                                for (const r of questionResults) {
                                  if (r.isCorrect) {
                                    curr += 1;
                                    if (curr > best) best = curr;
                                  } else {
                                    curr = 0;
                                  }
                                }
                                setMaxStreak(best);
                              } catch {
                                // ignore
                              }
                              getProfile();
                              getTotalLearnedVocabCount();
                              // Advance one step forward from the current page so the pager
                              // performs a normal in-place swipe to the QuizResult page.
                              setStep((prev) => prev + 1);
                            })();
                          }
                          return newQueue;
                        }
                        // Trả lời sai -> đẩy xuống cuối
                        return [...rest, head];
                      });
                    }
                  }}
                  checkLabel="Check"
                  continueLabel="Continue"
                  correctMessage="Chính xác"
                  incorrectMessage={
                    "Đáp án đúng là: " +
                    (questionsData?.questions[currentQuestionIndex]
                      ?.correct_answer ?? "")
                  }
                  // New props for bottom-sheet hinting
                  questionType={q.type}
                  questionMeaning={q.question_vn}
                />
              );
            })()
          : null}

        {/* Result step */}
        <QuizResult
          questionResults={questionResults}
          stats={[
            {
              icon: "timer-outline",
              color: colors.accent.purple,
              text: "Time",
              value: formatTime(totalTimeSec),
            },
            {
              icon: "flame-outline",
              color: colors.accent.red,
              text: "Streak",
              value: `${maxStreak} in a row`,
            },
            {
              icon: "flash-outline",
              color: colors.accent.yellow,
              text: "EXP",
              value: `${expGained}`,
            },
          ]}
          onContinue={() => router.back()}
        />
      </FlowPager>

      {/* Overlay spinner during update to keep pager state stable */}
      {(isUpdatingProgress || isAwaitingQuestions) && (
        <View
          pointerEvents="auto"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          <ActivityIndicator size="large" color={colors.primary.main} />
        </View>
      )}
    </View>
  );
};

const LearningScreenWrapper = () => {
  const isFocused = useIsFocused();

  // Khi người dùng chuyển sang tab khác (Home, Profile...), isFocused = false
  // Component trả về null -> LearningContent bị hủy (Unmount) -> State chết
  if (!isFocused) {
    return null;
  }

  console.log("isFocus", isFocused);
  // Khi quay lại tab này, isFocused = true
  // LearningContent được tạo mới (Mount) -> State chạy lại từ đầu (reset)
  return <Index />;
};

export default LearningScreenWrapper;
