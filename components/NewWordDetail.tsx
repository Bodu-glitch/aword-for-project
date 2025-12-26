import { getColors } from "@/utls/colors";
import { useColorScheme } from "nativewind";
import React from "react";
import { Pressable, Text, View } from "react-native";
import PlayAudioButton from "@/components/PlayAudioButton";

type WordPart = {
  text: string | null;
};

type AnatomyItem = {
  badgeLabel: string; // Prefix, Origin, Postfix
  part: string; // ad-, -vent-, -ure
  meaning: string; // Vietnamese meaning
};

type NewWordDetailProps = {
  progress?: number; // 0..1
  wordParts: WordPart[];
  ipa: string;
  pos: string;
  viDefinition: string;
  example?: string;
  anatomy: AnatomyItem[];
  onContinue?: () => void;
  continueLabel?: string;
  onSpeak?: () => void;
  audioPath: string;
  // FlowPager will inject this so children can know when they are visible
  isActive?: boolean;
};

function clamp(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export default function NewWordDetail(props: NewWordDetailProps) {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  const progress = clamp(props.progress);
  const continueLabel = props.continueLabel ?? "Continue";

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      {/* Top progress */}
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

      {/* Header word line */}
      <View className="px-5 mt-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          {/* Render all non-empty parts and place a mid-dot directly between them
              (no extra spacing). We render them inside a single Text so layout
              doesn't introduce gaps. */}
          {(() => {
            const parts = props.wordParts
              .map((p) => (p && p.text ? p.text : null))
              .filter(Boolean) as string[];

            return (
              <Text
                className="text-4xl font-semibold"
                style={{ color: colors.text.primary }}
              >
                {parts.length > 0
                  ? parts.map((t, i) => (
                      <React.Fragment key={i}>
                        <Text style={{ color: colors.text.primary }}>{t}</Text>
                        {i < parts.length - 1 && (
                          <Text style={{ color: colors.text.secondary }}>
                            ·
                          </Text>
                        )}
                      </React.Fragment>
                    ))
                  : null}
              </Text>
            );
          })()}

          {/* Small gap before the audio button so icon isn't glued to the word */}
          <View style={{ width: 8 }} />
          <PlayAudioButton
            audioPath={props.audioPath}
            autoPlay={!!props.isActive}
          />
        </View>
        <Text className="text-xl" style={{ color: colors.text.secondary }}>
          {props.pos}
        </Text>
      </View>

      {/* IPA */}
      <View className="px-5 mt-2">
        <Text className="text-xl" style={{ color: colors.text.secondary }}>
          {props.ipa}
        </Text>
      </View>

      {/* Vietnamese definition & example */}
      <View className="px-5 mt-6">
        <Text
          className="text-2xl font-semibold"
          style={{ color: colors.text.primary }}
        >
          {props.viDefinition}
        </Text>
        {props.example ? (
          <Text
            className="text-base mt-3"
            style={{ color: colors.text.secondary }}
          >
            {props.example}
          </Text>
        ) : null}
      </View>

      {/* Anatomy */}
      <View className="px-5 mt-10">
        <Text
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Anatomy
        </Text>
        <View className="mt-6">
          {props.anatomy.map(
            (item, idx) =>
              item.part &&
              item.meaning && (
                <View key={idx} className="flex-row items-center mb-4">
                  <View className="flex-row items-center w-40">
                    <View
                      className="h-10 w-20 items-center justify-center rounded-l-full"
                      style={{
                        backgroundColor:
                          idx === 0
                            ? colors.accent.red
                            : idx === 1
                              ? colors.accent.purple
                              : colors.accent.green,
                      }}
                    >
                      <Text className="text-white font-semibold">
                        {item.badgeLabel}
                      </Text>
                    </View>
                    <Text
                      className="ml-3 text-xl font-semibold"
                      style={{ color: colors.text.primary }}
                    >
                      {item.part}
                    </Text>
                  </View>
                  <Text
                    className="flex-1 ml-16 text-lg text-left"
                    style={{ color: colors.text.secondary }}
                  >
                    {item.meaning}
                  </Text>
                </View>
              ),
          )}
        </View>
      </View>

      {/* Continue Button */}
      <View className="px-5 pb-8 mt-auto">
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
