import type { QuestionResult } from "@/lib/features/vocab/vocabApi";
import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";

type StatItem = {
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  text: string;
  value: number | string;
};

type QuizResultProps = {
  title?: string;
  stats: StatItem[];
  questionResults?: QuestionResult[];
  onContinue?: () => void;
  continueLabel?: string;
};

// Animated stat card component - Compact version for grid
function AnimatedStatCard({
  icon,
  color,
  text,
  value,
  delay = 0,
  colors,
}: StatItem & { delay?: number; colors: ReturnType<typeof getColors> }) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
      }}
    >
      <View
        className="rounded-2xl px-4 py-4 items-center"
        style={{
          backgroundColor: colors.surface.secondary,
        }}
      >
        <View
          className="rounded-full p-2.5 mb-2"
          style={{ backgroundColor: color + "20" }}
        >
          <Ionicons
            name={icon}
            size={20}
            color={color ?? colors.text.primary}
          />
        </View>
        <Text
          className="text-lg font-bold mb-1 text-center"
          style={{ color: colors.text.primary }}
        >
          {value}
        </Text>
        <Text
          className="text-xs text-center"
          style={{ color: colors.text.secondary }}
        >
          {text}
        </Text>
      </View>
    </Animated.View>
  );
}

// Accuracy Display Component - Prominent
function AccuracyDisplay({
  questionResults,
  delay = 0,
  colors,
}: {
  questionResults: QuestionResult[];
  delay?: number;
  colors: ReturnType<typeof getColors>;
}) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const accuracyAnim = React.useRef(new Animated.Value(0)).current;
  const [displayedAccuracy, setDisplayedAccuracy] = React.useState(0);

  const totalQuestions = questionResults.length;
  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(accuracyAnim, {
      toValue: accuracy,
      duration: 1500,
      delay: delay + 300,
      useNativeDriver: false,
    }).start();
  }, [delay, accuracy]);

  useEffect(() => {
    const accuracyListener = accuracyAnim.addListener(({ value }) => {
      setDisplayedAccuracy(Math.round(value));
    });
    return () => {
      accuracyAnim.removeListener(accuracyListener);
    };
  }, [accuracyAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        className="rounded-3xl px-6 py-8 items-center"
        style={{
          backgroundColor: colors.surface.secondary,
        }}
      >
        <View
          className="rounded-full w-32 h-32 items-center justify-center mb-3"
          style={{
            backgroundColor:
              accuracy >= 80
                ? colors.accent.green + "20"
                : accuracy >= 60
                  ? colors.accent.yellow + "20"
                  : colors.accent.red + "20",
          }}
        >
          <Text
            className="text-5xl font-bold text-center"
            style={{
              color:
                accuracy >= 80
                  ? colors.accent.green
                  : accuracy >= 60
                    ? colors.accent.yellow
                    : colors.accent.red,
              textAlign: "center",
            }}
          >
            {displayedAccuracy}%
          </Text>
        </View>
        <Text
          className="text-base font-medium"
          style={{ color: colors.text.secondary }}
        >
          Accuracy
        </Text>
      </View>
    </Animated.View>
  );
}

// Summary card component - Detailed Breakdown
function SummaryCard({
  questionResults,
  delay = 0,
  colors,
}: {
  questionResults: QuestionResult[];
  delay?: number;
  colors: ReturnType<typeof getColors>;
}) {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const accuracyAnim = React.useRef(new Animated.Value(0)).current;
  const [displayedAccuracy, setDisplayedAccuracy] = React.useState(0);

  const totalQuestions = questionResults.length;
  const correctCount = questionResults.filter((r) => r.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;
  const accuracy =
    totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const correctAnim = React.useRef(new Animated.Value(0)).current;
  const incorrectAnim = React.useRef(new Animated.Value(0)).current;
  const totalAnim = React.useRef(new Animated.Value(0)).current;
  const [displayedCorrect, setDisplayedCorrect] = React.useState(0);
  const [displayedIncorrect, setDisplayedIncorrect] = React.useState(0);
  const [displayedTotal, setDisplayedTotal] = React.useState(0);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Count up animations
    const animDelay = delay + 300;
    Animated.parallel([
      Animated.timing(accuracyAnim, {
        toValue: accuracy,
        duration: 1500,
        delay: animDelay,
        useNativeDriver: false,
      }),
      Animated.timing(correctAnim, {
        toValue: correctCount,
        duration: 1200,
        delay: animDelay + 200,
        useNativeDriver: false,
      }),
      Animated.timing(incorrectAnim, {
        toValue: incorrectCount,
        duration: 1200,
        delay: animDelay + 400,
        useNativeDriver: false,
      }),
      Animated.timing(totalAnim, {
        toValue: totalQuestions,
        duration: 1200,
        delay: animDelay + 600,
        useNativeDriver: false,
      }),
    ]).start();
  }, [delay, accuracy, correctCount, incorrectCount, totalQuestions]);

  useEffect(() => {
    const accuracyListener = accuracyAnim.addListener(({ value }) => {
      setDisplayedAccuracy(Math.round(value));
    });
    const correctListener = correctAnim.addListener(({ value }) => {
      setDisplayedCorrect(Math.round(value));
    });
    const incorrectListener = incorrectAnim.addListener(({ value }) => {
      setDisplayedIncorrect(Math.round(value));
    });
    const totalListener = totalAnim.addListener(({ value }) => {
      setDisplayedTotal(Math.round(value));
    });

    return () => {
      accuracyAnim.removeListener(accuracyListener);
      correctAnim.removeListener(correctListener);
      incorrectAnim.removeListener(incorrectListener);
      totalAnim.removeListener(totalListener);
    };
  }, [accuracyAnim, correctAnim, incorrectAnim, totalAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        className="rounded-3xl px-6 py-5"
        style={{
          backgroundColor: colors.surface.secondary,
        }}
      >
        {/* Stats Grid */}
        <View className="flex-row justify-around">
          <View className="items-center flex-1">
            <Text
              className="text-2xl font-bold mb-1"
              style={{ color: colors.accent.green }}
            >
              {displayedCorrect}
            </Text>
            <Text className="text-xs" style={{ color: colors.text.secondary }}>
              Correct
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text
              className="text-2xl font-bold mb-1"
              style={{ color: colors.accent.red }}
            >
              {displayedIncorrect}
            </Text>
            <Text className="text-xs" style={{ color: colors.text.secondary }}>
              Incorrect
            </Text>
          </View>
          <View className="items-center flex-1">
            <Text
              className="text-2xl font-bold mb-1"
              style={{ color: colors.text.primary }}
            >
              {displayedTotal}
            </Text>
            <Text className="text-xs" style={{ color: colors.text.secondary }}>
              Total
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function QuizResult(props: QuizResultProps) {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const title = props.title ?? "Good job!";
  const continueLabel = props.continueLabel ?? "Continue";

  const titleFadeAnim = React.useRef(new Animated.Value(0)).current;
  const titleScaleAnim = React.useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Animate title
    Animated.parallel([
      Animated.timing(titleFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(titleScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View className="items-center px-6 pt-8 pb-4">
          <Animated.View
            style={{
              opacity: titleFadeAnim,
              transform: [{ scale: titleScaleAnim }],
            }}
          >
            <Text
              className="text-4xl font-bold text-center mb-1"
              style={{ color: colors.text.primary }}
            >
              {title}
            </Text>
            {props.questionResults && props.questionResults.length > 0 && (
              <Text
                className="text-sm text-center"
                style={{ color: colors.text.secondary }}
              >
                You completed {props.questionResults.length} questions
              </Text>
            )}
          </Animated.View>
        </View>

        {/* Accuracy - Prominent Display */}
        {props.questionResults && props.questionResults.length > 0 && (
          <View className="px-5 mb-6">
            <AccuracyDisplay
              questionResults={props.questionResults}
              delay={200}
              colors={colors}
            />
          </View>
        )}

        {/* Performance Stats - Grid Layout */}
        <View className="px-5 mb-6">
          <Text
            className="text-lg font-semibold mb-3"
            style={{ color: colors.text.primary }}
          >
            Performance
          </Text>
          <View className="flex-row">
            {props.stats.map((s, idx) => (
              <View
                key={idx}
                style={{
                  flex: 1,
                  marginRight: idx < props.stats.length - 1 ? 8 : 0,
                }}
              >
                <AnimatedStatCard
                  icon={s.icon}
                  color={s.color}
                  text={s.text}
                  value={s.value}
                  delay={300 + idx * 100}
                  colors={colors}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Detailed Breakdown */}
        {props.questionResults && props.questionResults.length > 0 && (
          <View className="px-5 mb-6">
            <Text
              className="text-lg font-semibold mb-3"
              style={{ color: colors.text.primary }}
            >
              Breakdown
            </Text>
            <SummaryCard
              questionResults={props.questionResults}
              delay={600}
              colors={colors}
            />
          </View>
        )}
      </ScrollView>

      {/* Continue Button */}
      <View
        className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{
          backgroundColor: colors.background.primary,
        }}
      >
        <Pressable
          onPress={props.onContinue}
          className="rounded-2xl items-center justify-center py-4"
          style={{ backgroundColor: colors.primary.main }}
        >
          <Text
            className="text-base font-semibold"
            style={{ color: colors.text.button }}
          >
            {continueLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
