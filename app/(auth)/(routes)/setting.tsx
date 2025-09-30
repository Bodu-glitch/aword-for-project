import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Switch } from "heroui-native";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Setting = () => {
  const { toggleColorScheme, colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [selectedFontSize, setSelectedFontSize] = useState("Medium");
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [isFontSizeExpanded, setIsFontSizeExpanded] = useState(false);

  // Sync local state with colorScheme changes
  useEffect(() => {
    setIsDarkMode(colorScheme === "dark");
  }, [colorScheme]);

  const handleDarkModeToggle = () => {
    toggleColorScheme();
  };

  const SettingCard = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <View
      className={`rounded-2xl shadow-sm border ${className}`}
      style={{
        backgroundColor: colors.background.secondary,
        borderColor: colors.border.primary,
      }}
    >
      {children}
    </View>
  );

  const RadioButton = ({
    selected,
    onPress,
  }: {
    selected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      className="w-6 h-6 rounded-full border-2 items-center justify-center"
      style={{ borderColor: colors.border.secondary }}
    >
      {selected && (
        <View
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: colors.accent.blue }}
        />
      )}
    </Pressable>
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.tertiary }}
    >
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <Pressable className="mr-4" onPress={() => router.push("/home")}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </Pressable>
        <Text
          className="text-2xl font-bold"
          style={{ color: colors.text.primary }}
        >
          Setting
        </Text>
      </View>

      <View className="flex-1 px-6">
        {/* Dark Mode Section */}
        <SettingCard className="mb-4">
          <View className="flex-row items-center justify-between p-4">
            <Text
              className="text-lg font-medium"
              style={{ color: colors.text.primary }}
            >
              Dark mode
            </Text>
            <Switch isSelected={isDarkMode} onPress={handleDarkModeToggle} />
          </View>
        </SettingCard>

        {/* Font Size Section */}
        {/* <SettingCard className="mb-4">
          <Pressable
            onPress={() => setIsFontSizeExpanded(!isFontSizeExpanded)}
            className="p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text
                className="text-lg font-medium"
                style={{ color: colors.text.primary }}
              >
                Font size
              </Text>
              <Ionicons
                name={isFontSizeExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.text.secondary}
              />
            </View>
          </Pressable>

          {isFontSizeExpanded && (
            <View
              className="px-4 pb-4"
              style={{
                borderTopColor: colors.border.primary,
                borderTopWidth: 1,
              }}
            >
              <View className="flex-row items-center justify-between py-3">
                <Text
                  className="text-base"
                  style={{ color: colors.text.secondary }}
                >
                  Small
                </Text>
                <RadioButton
                  selected={selectedFontSize === "Small"}
                  onPress={() => setSelectedFontSize("Small")}
                />
              </View>
              <View className="flex-row items-center justify-between py-3">
                <Text
                  className="text-base"
                  style={{ color: colors.text.secondary }}
                >
                  Medium
                </Text>
                <RadioButton
                  selected={selectedFontSize === "Medium"}
                  onPress={() => setSelectedFontSize("Medium")}
                />
              </View>
              <View className="flex-row items-center justify-between py-3">
                <Text
                  className="text-base"
                  style={{ color: colors.text.secondary }}
                >
                  Big
                </Text>
                <RadioButton
                  selected={selectedFontSize === "Big"}
                  onPress={() => setSelectedFontSize("Big")}
                />
              </View>
            </View>
          )}
        </SettingCard> */}

        {/* Notifications Section */}
        {/* <SettingCard className="mb-4">
          <Pressable className="flex-row items-center justify-between p-4">
            <Text
              className="text-lg font-medium"
              style={{ color: colors.text.primary }}
            >
              Notifications
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.secondary}
            />
          </Pressable>
        </SettingCard> */}
      </View>
    </SafeAreaView>
  );
};

export default Setting;
