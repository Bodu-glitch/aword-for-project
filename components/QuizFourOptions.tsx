import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";

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

  const progress = clamp(props.progress);
  const isCheckEnabled =
    props.selectedIndex !== null && props.selectedIndex !== undefined;
  const checkLabel = props.checkLabel ?? "Check";
  const continueLabel = props.continueLabel ?? "Continue";
  const isCorrect =
    props.checked &&
    props.selectedIndex !== null &&
    props.selectedIndex === props.correctIndex;

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
            style={{ backgroundColor: colors.surface.secondary }}
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

      {/* Bottom Action Area */}
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

      {props.checked ? (
        <View className="absolute left-0 right-0 bottom-0">
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
      ) : null}
    </View>
  );
}
