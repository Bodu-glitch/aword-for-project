import FlowPager from "@/components/FlowPager";
import NewWord from "@/components/NewWord";
import NewWordDetail from "@/components/NewWordDetail";
import QuizFourOptions from "@/components/QuizFourOptions";
import QuizResult from "@/components/QuizResult";
import { useGetQuestionsQuery } from "@/lib/features/learn/learnApi";
import {
  useUpdateVocabsProgressMutation,
  type QuestionResult,
} from "@/lib/features/vocab/vocabApi";
import { getColors } from "@/utls/colors";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { ActivityIndicator, Text, View } from "react-native";

const Index = () => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [step, setStep] = React.useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<(number | null)[]>([]);
  const [checked, setChecked] = React.useState<boolean[]>([]);
  // State để lưu kết quả từng câu trả lời (kèm thời gian)
  const [questionResults, setQuestionResults] = React.useState<
    QuestionResult[]
  >([]);
  // Track start time of current question
  const [questionStartMs, setQuestionStartMs] = React.useState<number>(
    Date.now(),
  );
  const [updateProgress, { isLoading: isUpdatingProgress }] =
    useUpdateVocabsProgressMutation();

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
    }
  }, [questionsData]);

  // Reset timer when moving to a new question
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

  // Render only the current question
  const question = questionsData.questions[currentQuestionIndex];
  let options: string[] = [];
  let correctIndex = 0;
  if (
    question.type === "multiple_choice" &&
    Array.isArray(question.answer_blocks)
  ) {
    options = question.answer_blocks;
    correctIndex = options.findIndex((opt) => opt === question.correct_answer);
  } else if (
    question.type === "fill_in_blank" &&
    Array.isArray(question.answer_blocks)
  ) {
    options = question.answer_blocks;
    correctIndex = options.findIndex((opt) => opt === question.correct_answer);
  }

  // Calculate total units: each new word counts as 1 unit, each quiz question counts as 1 unit
  const totalWords = questionsData?.newWords?.length ?? 0;
  const totalQuestions = questionsData?.questions?.length ?? 0;
  const totalUnits = totalWords + totalQuestions;

  // Map a unit index to normalized progress (0..1)
  const getUnitProgress = (unitIndex: number) =>
    totalUnits > 0
      ? Math.max(0, Math.min(1, (unitIndex + 1) / totalUnits))
      : 0;

  // Helper to get word parts for NewWordDetail
  const getWordParts = (word: any) => [
    { text: word.prefix },
    { text: "·" },
    { text: word.infix },
    { text: "·" },
    { text: word.postfix },
  ];

  // Helper to get anatomy for NewWordDetail
  const getAnatomy = (word: any) => [
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
  ];

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      <FlowPager index={step}>
        {/* Dynamically render NewWord and NewWordDetail for each new word */}
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
            wordParts={getWordParts(word)}
            pos={word.vocab_senses[0]?.pos || ""}
            ipa={word.phonetic}
            viDefinition={word.vocab_senses[0]?.definition || ""}
            example={word.vocab_senses[0]?.word || ""}
            anatomy={getAnatomy(word)}
            onContinue={() => setStep(idx * 2 + 2)}
          />,
        ])}

        {/* Quiz step: after all words */}
        <QuizFourOptions
          progress={getUnitProgress(totalWords + currentQuestionIndex)}
          title={question.question}
          prompt={question.question}
          promptColorClass="text-red-600"
          options={options}
          selectedIndex={selected[currentQuestionIndex]}
          onSelect={(i) => {
            const newSelected = [...selected];
            newSelected[currentQuestionIndex] = i;
            setSelected(newSelected);
            if (checked[currentQuestionIndex]) {
              const newChecked = [...checked];
              newChecked[currentQuestionIndex] = false;
              setChecked(newChecked);
              // restart timer if user changed selection after checking
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

              // Lưu kết quả câu hỏi hiện tại với thời gian trả lời
              const userAnswerIndex = selected[currentQuestionIndex];
              const userAnswer =
                userAnswerIndex !== null ? options[userAnswerIndex] : "";
              const isCorrect = userAnswer === question.correct_answer;
              const durationMs = Math.max(0, Date.now() - questionStartMs);
              const durationSec = Math.max(1, Math.round(durationMs / 1000));

              const newResult: QuestionResult = {
                question: question.question,
                userAnswer,
                correctAnswer: question.correct_answer,
                isCorrect,
                vocabId: question.vocab_id,
                durationSec,
              };

              setQuestionResults((prev) => [...prev, newResult]);
            } else {
              // Move to next question or show results
              if (currentQuestionIndex < questionsData.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
              } else {
                // Submit progress to Supabase then show results
                try {
                  console.log("Submitting question results:", questionResults);
                  await updateProgress({
                    questionResults,
                    allWords: questionsData.allWords,
                  }).unwrap();
                } catch {
                  // swallow error for now; could show a toast
                }
                setStep(totalWords * 2 + 1);
              }
            }
          }}
          checkLabel="Check"
          continueLabel="Continue"
          correctMessage="Chính xác"
          incorrectMessage={`Đáp án đúng là: ${question.correct_answer}`}
        />

        {/* Result step: after quiz */}
        <QuizResult
          stats={[
            {
              icon: "timer-outline",
              color: colors.accent.purple,
              text: "2:30 - Super fast",
            },
            {
              icon: "flame-outline",
              color: colors.accent.red,
              text: "10 in a row",
            },
            {
              icon: "flash-outline",
              color: colors.accent.yellow,
              text: "40 exp",
            },
          ]}
          onContinue={() => router.back()}
        />
      </FlowPager>
    </View>
  );
};

export default Index;
