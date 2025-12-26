import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer } from "expo-audio";
import { useColorScheme } from "nativewind";
import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type QuizFourOptionsProps = {
  progress?: number; // 0..1
  title: string; // e.g. "Nghĩa của tiền tố"
  prompt: string; // e.g. "ad-"
  promptColorClass?: string; // e.g. 'text-red-600'
  options: string[]; // four options
  selectedIndex: number | null;
  onSelect: (index: number) => void;
  correctIndex: number; // index of correct answer
  checked: boolean; // whether user pressed Check
  onCheck?: () => void; // called when pressing Check/Continue
  checkLabel?: string; // label before checked
  continueLabel?: string; // label after checked
  correctMessage?: string;
  incorrectMessage?: string; // can include correct hint
  // New optional props to control modal hinting
  questionType?: "fill_in_blank" | "multiple_choice";
  questionMeaning?: string; // meaning/hint text; we'll replace !empty -> ___ when shown
};

function clamp(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export default function QuizFourOptions(props: QuizFourOptionsProps) {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  // Create two audio players (they auto-release on unmount)
  const correctPlayer = useAudioPlayer(require("../assets/sounds/right.mp3"));
  const wrongPlayer = useAudioPlayer(require("../assets/sounds/wrong.mp3"));

  const progress = clamp(props.progress);
  const isCheckEnabled =
    props.selectedIndex !== null && props.selectedIndex !== undefined;
  const checkLabel = props.checkLabel ?? "Check";
  const continueLabel = props.continueLabel ?? "Continue";
  const isCorrect =
    props.checked &&
    props.selectedIndex !== null &&
    props.selectedIndex === props.correctIndex;

  // Play the appropriate sound when question becomes checked
  React.useEffect(() => {
    if (!props.checked) return;

    (async () => {
      try {
        if (isCorrect) {
          // seek to start if possible then play

          console.log("Playing correct sound");
          await correctPlayer.seekTo?.(0);

          correctPlayer.play();
        } else {
          console.log("Playing wrong sound");
          await wrongPlayer.seekTo?.(0);

          wrongPlayer.play();
        }
      } catch {
        // ignore errors
      }
    })();
  }, [props.checked, isCorrect, correctPlayer, wrongPlayer]);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Progress */}
      <View className="px-5 pt-6">
        <View
          className="h-3 w-full rounded-full overflow-hidden"
          style={{ backgroundColor: colors.surface.secondary }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: colors.primary.main,
            }}
          />
        </View>
      </View>

      {/* Question Section */}
      <View className="flex-1 items-center pt-4 px-5">
        <View className="w-full items-center">
          {/* Question Prompt with styled container */}
          <View
            className="w-full px-6 py-4 rounded-3xl"
            style={{
              backgroundColor:
                colorScheme === "dark"
                  ? "transparent"
                  : colors.surface.secondary,
            }}
          >
            <Text
              className={`text-3xl font-semibold leading-relaxed ${props.promptColorClass ?? ""}`}
              style={{
                color: colors.text.primary,
              }}
            >
              {props.prompt}
            </Text>
          </View>
        </View>
      </View>

      {/* Options */}
      <View className={`px-5 ${props.checked ? "pb-48" : "pb-5"}`}>
        {props.options.map((opt, idx) => {
          const isSelected = props.selectedIndex === idx;
          let backgroundColor = colors.surface.secondary;
          let textColor = colors.text.primary;
          let borderColor = colors.border.primary;

          if (isSelected && !props.checked) {
            backgroundColor = colors.primary.main;
            textColor = colors.text.button;
            borderColor = colors.primary.main;
          }
          if (props.checked && isSelected) {
            if (idx === props.correctIndex) {
              backgroundColor = colors.accent.green;
              textColor = colors.text.inverse;
              borderColor = colors.accent.green;
            } else {
              backgroundColor = colors.accent.red;
              textColor = colors.text.inverse;
              borderColor = colors.accent.red;
            }
          }

          return (
            <Pressable
              key={idx}
              className="rounded-2xl px-4 py-4 mb-4 border"
              style={{ backgroundColor, borderColor }}
              onPress={() => props.onSelect(idx)}
            >
              <Text className="text-base" style={{ color: textColor }}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Bottom Action Area - Check button */}
      {!props.checked ? (
        <View className="px-5 pb-8">
          <Pressable
            onPress={isCheckEnabled ? props.onCheck : undefined}
            disabled={!isCheckEnabled}
            className="rounded-2xl items-center justify-center py-4"
            style={{
              backgroundColor: isCheckEnabled
                ? colors.primary.main
                : colors.surface.tertiary,
            }}
          >
            <Text
              className="text-base font-semibold"
              style={{
                color: isCheckEnabled
                  ? colors.text.button
                  : colors.text.tertiary,
              }}
            >
              {checkLabel}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* Result Modal when checked */}
      {props.checked ? (
        <Modal
          visible={true}
          transparent={true}
          animationType="none"
          statusBarTranslucent
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.25)",
              justifyContent: "flex-end",
            }}
          >
            {/* Bottom sheet container occupying part of the screen */}
            <View
              className="rounded-t-3xl px-5 pt-6 pb-8"
              style={{
                backgroundColor: isCorrect
                  ? colors.accent.green
                  : colors.accent.red,
              }}
            >
              <View className="flex-row items-center mb-4">
                <Ionicons
                  name={
                    isCorrect
                      ? "checkmark-circle-outline"
                      : "close-circle-outline"
                  }
                  size={24}
                  color={colors.text.inverse}
                />
                <Text
                  className="ml-2 text-base font-semibold"
                  style={{ color: colors.text.inverse }}
                >
                  {isCorrect
                    ? (props.correctMessage ?? "Chính xác")
                    : (props.incorrectMessage ?? "Sai")}
                </Text>
              </View>

              {/* Extra hint: show meaning for wrong fill-in-blank; replace !empty -> ___ */}
              {!isCorrect &&
              props.questionType === "fill_in_blank" &&
              props.questionMeaning ? (
                <View className="mb-4">
                  <Text
                    className="text-base"
                    style={{ color: colors.text.inverse }}
                  >
                    {props.questionMeaning.replace(/!empty/gi, "___")}
                  </Text>
                </View>
              ) : null}

              <Pressable
                onPress={props.onCheck}
                className="rounded-2xl items-center justify-center py-4"
                style={{ backgroundColor: colors.background.primary }}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: colors.text.primary }}
                >
                  {continueLabel}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
