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
  useSetProgressingRootToFalseMutation,
} from "@/lib/features/vocab/vocabApi";
import { getColors } from "@/utls/colors";
import { router, useLocalSearchParams } from "expo-router";
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
  const [questionResults, setQuestionResults] = React.useState<
    QuestionResult[]
  >([]);
  const [questionStartMs, setQuestionStartMs] = React.useState<number>(
    Date.now(),
  );
  const [updateProgress, { isLoading: isUpdatingProgress }] =
    useUpdateVocabsProgressMutation();
  const [setProgressingRootToFalse] = useSetProgressingRootToFalseMutation();

  const [getProfile] = useLazyGetProfileQuery();
  const [getTotalLearnedVocabCount] = useLazyGetTotalLearnedVocabCountQuery();

  const [expGained, setExpGained] = React.useState(0);
  const [totalTimeSec, setTotalTimeSec] = React.useState(0);
  const [maxStreak, setMaxStreak] = React.useState(0);

  const [questionQueue, setQuestionQueue] = React.useState<number[]>([]);

  const [pendingStep, setPendingStep] = React.useState<number | null>(null);
  const [isAwaitingQuestions, setIsAwaitingQuestions] = React.useState(false);

  const params = useLocalSearchParams();
  const rootId = (params.rootId as string) || (params.chapter as string);
  const wordCountParam = params.wordCount as string | undefined;
  const wordCount = wordCountParam ? parseInt(wordCountParam, 10) : undefined;

  const { data: newWordsData, isLoading: isGettingNewWords } =
    useGetNewWordQuery({ rootId, wordCount } as any, {
      refetchOnMountOrArgChange: true,
    });

  const { data: questionsData, isLoading: isGettingQuestions } =
    useGetQuestionsQuery(
      newWordsData?.allSenses ? newWordsData.allSenses : (undefined as any),
      {
        skip: !newWordsData?.allSenses,
      },
    );

  React.useEffect(() => {
    console.log("questionsData", questionsData);
    if (questionsData?.questions) {
      setSelected(Array(questionsData.questions.length).fill(null));
      setChecked(Array(questionsData.questions.length).fill(false));
      setCurrentQuestionIndex(0);
      setQuestionResults([]);
      setQuestionStartMs(Date.now());
      setQuestionQueue(questionsData.questions.map((_, i) => i));
      if (pendingStep !== null) {
        setStep(pendingStep);
        setPendingStep(null);
        setIsAwaitingQuestions(false);
      }
    }
  }, [questionsData, pendingStep]);

  React.useEffect(() => {
    if (questionQueue.length > 0) {
      setCurrentQuestionIndex(questionQueue[0]);
    }
  }, [questionQueue]);

  React.useEffect(() => {
    setQuestionStartMs(Date.now());
  }, [currentQuestionIndex]);
  React.useEffect(() => {
    console.log("newWordsData", newWordsData);
  }, [newWordsData]);

  const totalWords = newWordsData?.newWords?.length ?? 0;
  const quizStartIndex = totalWords * 2;

  const shouldBlockAdvance =
    totalWords > 0 && isGettingQuestions && !questionsData;

  const displayedIndex = shouldBlockAdvance
    ? Math.min(step, quizStartIndex - 1)
    : step;

  if (
    (isGettingNewWords && !newWordsData) ||
    (!isGettingNewWords &&
      newWordsData &&
      newWordsData?.newWords?.length === 0 &&
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

  const getUnitProgress = (unitIndex: number) =>
    totalUnits > 0 ? Math.max(0, Math.min(1, (unitIndex + 1) / totalUnits)) : 0;

  const masteredCount = Math.max(0, totalQuestions - questionQueue.length);
  const overallProgress =
    totalUnits > 0 ? (totalWordsCount + masteredCount) / totalUnits : 0;

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
      <FlowPager index={displayedIndex}>
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

        {hasQuestions
          ? (() => {
              const q = questionsData!.questions[currentQuestionIndex];
              const opts = Array.isArray(q.answer_blocks)
                ? q.answer_blocks
                : [];
              const correctIndex = opts.findIndex(
                (opt: any) => opt === q.correct_answer,
              );
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
                              setProgressingRootToFalse();
                              setStep(totalWords * 2 + 1);
                            })();
                          }
                          return newQueue;
                        }
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
                  questionType={q.type}
                  questionMeaning={q.question_vn}
                />
              );
            })()
          : null}

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

  if (!isFocused) {
    return null;
  }

  console.log("isFocus", isFocused);
  return <Index />;
};

export default LearningScreenWrapper;
