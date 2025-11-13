import FlowPager from "@/components/FlowPager";
import NewWord from "@/components/NewWord";
import NewWordDetail from "@/components/NewWordDetail";
import QuizFourOptions from "@/components/QuizFourOptions";
import QuizResult from "@/components/QuizResult";
import { useGetQuestionsQuery } from "@/lib/features/learn/learnApi";
import {
  useUpdateVocabsProgressMutation,
  type QuestionResult,
  useLazyGetTotalLearnedVocabCountQuery,
} from "@/lib/features/vocab/vocabApi";
import { getColors } from "@/utls/colors";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { useLazyGetProfileQuery } from "@/lib/features/profile/profileApi";

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

  const { data: questionsData, isLoading: isGettingQuestions } =
    useGetQuestionsQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  React.useEffect(() => {
    if (questionsData?.questions) {
      setSelected(Array(questionsData.questions.length).fill(null));
      setChecked(Array(questionsData.questions.length).fill(false));
      setCurrentQuestionIndex(0);
      setQuestionResults([]);
      setQuestionStartMs(Date.now());
      // Khởi tạo hàng đợi: 0..n-1
      setQuestionQueue(questionsData.questions.map((_, i) => i));
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

  if (isGettingQuestions || isUpdatingProgress) {
    return (
      <View
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: colors.background.primary }}
      >
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!questionsData) {
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

  const totalWords = questionsData?.newWords?.length ?? 0;
  const totalQuestions = questionsData?.questions?.length ?? 0;
  const totalUnits = totalWords + totalQuestions;
  const hasQuestions = totalQuestions > 0;

  // Progress helper: 0..1 theo tổng unit (words + mastered questions)
  const getUnitProgress = (unitIndex: number) =>
    totalUnits > 0 ? Math.max(0, Math.min(1, (unitIndex + 1) / totalUnits)) : 0;

  // Số câu đã master = tổng câu - số còn trong hàng đợi
  const masteredCount = Math.max(0, totalQuestions - questionQueue.length);
  const overallProgress =
    totalUnits > 0 ? (totalWords + masteredCount) / totalUnits : 0;

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
      <FlowPager index={step}>
        {/* New words pages */}
        {questionsData?.newWords?.map((word, idx) => [
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
              { text: word.prefix },
              { text: "·" },
              { text: word.infix },
              { text: "·" },
              { text: word.postfix },
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
            onContinue={() => setStep(idx * 2 + 2)}
            audioPath={word.audio_path}
          />,
        ])}

        {/* Quiz step: only render if there are questions */}
        {hasQuestions
          ? (() => {
              const q = questionsData.questions[currentQuestionIndex];
              const opts = Array.isArray(q.answer_blocks)
                ? q.answer_blocks
                : [];
              const correctIndex = opts.findIndex(
                (opt) => opt === q.correct_answer,
              );
              return (
                <QuizFourOptions
                  key={`quiz-${currentQuestionIndex}`}
                  progress={overallProgress}
                  title={q.question}
                  prompt={q.question}
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
                                  allWords: questionsData.allWords,
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
                              setStep(totalWords * 2 + 1);
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
                    (questionsData.questions[currentQuestionIndex]
                      ?.correct_answer ?? "")
                  }
                />
              );
            })()
          : null}

        {/* Result step */}
        <QuizResult
          stats={[
            {
              icon: "timer-outline",
              color: colors.accent.purple,
              text: `${formatTime(totalTimeSec)}`,
            },
            {
              icon: "flame-outline",
              color: colors.accent.red,
              text: `${maxStreak} in a row`,
            },
            {
              icon: "flash-outline",
              color: colors.accent.yellow,
              text: `${expGained} exp`,
            },
          ]}
          onContinue={() => router.back()}
        />
      </FlowPager>
    </View>
  );
};

export default Index;
