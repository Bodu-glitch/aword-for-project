import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Setting = () => {
  const { toggleColorScheme, colorScheme } = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === 'dark');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedFontSize, setSelectedFontSize] = useState('Medium');
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [isFontSizeExpanded, setIsFontSizeExpanded] = useState(false);

  const handleDarkModeToggle = (value: boolean) => {
    setIsDarkMode(value);
    toggleColorScheme();
  };

  const SettingCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <View className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${className}`}>
      {children}
    </View>
  );

  const RadioButton = ({ selected, onPress }: { selected: boolean; onPress: () => void }) => (
    <Pressable onPress={onPress} className="w-6 h-6 rounded-full border-2 border-gray-300 items-center justify-center">
      {selected && <View className="w-3 h-3 rounded-full bg-blue-600" />}
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center px-6 py-4">
        <Pressable className="mr-4" onPress={() => router.push("/home")}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </Pressable>
        <Text className="text-2xl font-bold text-gray-900">Setting</Text>
      </View>

      <View className="flex-1 px-6">
        {/* Dark Mode Section */}
        <SettingCard className="mb-4">
          <View className="flex-row items-center justify-between p-4">
            <Text className="text-lg font-medium text-gray-900">Dark mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
              thumbColor={isDarkMode ? '#FFFFFF' : '#FFFFFF'}
            />
          </View>
        </SettingCard>

        {/* Language Section */}
        <SettingCard className="mb-4">
          <Pressable 
            onPress={() => setIsLanguageExpanded(!isLanguageExpanded)}
            className="p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-gray-900">Language</Text>
              <Ionicons 
                name={isLanguageExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6B7280" 
              />
            </View>
          </Pressable>
          
          {isLanguageExpanded && (
            <View className="px-4 pb-4 border-t border-gray-100">
              <View className="flex-row items-center justify-between py-3">
                <Text className="text-base text-gray-700">Vietnamese</Text>
                <RadioButton 
                  selected={selectedLanguage === 'Vietnamese'} 
                  onPress={() => setSelectedLanguage('Vietnamese')} 
                />
              </View>
              <View className="flex-row items-center justify-between py-3">
                <Text className="text-base text-gray-700">English</Text>
                <RadioButton 
                  selected={selectedLanguage === 'English'} 
                  onPress={() => setSelectedLanguage('English')} 
                />
              </View>
            </View>
          )}
        </SettingCard>

        {/* Font Size Section */}
        <SettingCard className="mb-4">
          <Pressable 
            onPress={() => setIsFontSizeExpanded(!isFontSizeExpanded)}
            className="p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-medium text-gray-900">Font size</Text>
              <Ionicons 
                name={isFontSizeExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#6B7280" 
              />
            </View>
          </Pressable>
          
          {isFontSizeExpanded && (
            <View className="px-4 pb-4 border-t border-gray-100">
              <View className="flex-row items-center justify-between py-3">
                <Text className="text-base text-gray-700">Small</Text>
                <RadioButton 
                  selected={selectedFontSize === 'Small'} 
                  onPress={() => setSelectedFontSize('Small')} 
                />
              </View>
              <View className="flex-row items-center justify-between py-3">
                <Text className="text-base text-gray-700">Medium</Text>
                <RadioButton 
                  selected={selectedFontSize === 'Medium'} 
                  onPress={() => setSelectedFontSize('Medium')} 
                />
              </View>
              <View className="flex-row items-center justify-between py-3">
                <Text className="text-base text-gray-700">Big</Text>
                <RadioButton 
                  selected={selectedFontSize === 'Big'} 
                  onPress={() => setSelectedFontSize('Big')} 
                />
              </View>
            </View>
          )}
        </SettingCard>

        {/* Notifications Section */}
        <SettingCard className="mb-4">
          <Pressable className="flex-row items-center justify-between p-4">
            <Text className="text-lg font-medium text-gray-900">Notifications</Text>
            <Ionicons name="chevron-forward" size={20} color="#6B7280" />
          </Pressable>
        </SettingCard>
      </View>
    </SafeAreaView>
  );
};

export default Setting;
