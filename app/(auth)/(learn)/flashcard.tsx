import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get('window');

const Flashcard = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  const flipAnimation = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    if (isFlipped) {
      Animated.spring(flipAnimation, {
        toValue: 0,
        tension: 10,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(flipAnimation, {
        toValue: 1,
        tension: 10,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [{ rotateY: frontInterpolate }],
  };

  const backAnimatedStyle = {
    transform: [{ rotateY: backInterpolate }],
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center">
        {/* Flashcard Container */}
        <View className="relative w-full max-w-sm h-80">
          {/* Front Side */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                backfaceVisibility: 'hidden',
                width: '100%',
              },
              frontAnimatedStyle,
            ]}
          >
            <Pressable
              onPress={flipCard}
              className="bg-white rounded-2xl shadow-lg justify-center items-center self-center"
              style={{
                width: 320,
                height: 320,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {/* Refresh Button */}
              <Pressable className="absolute top-4 right-4">
                <Ionicons name="refresh" size={20} color="#666" />
              </Pressable>

              {/* Word */}
              <Text className="text-4xl font-bold text-black text-center mb-4">
                adventure
              </Text>
              
              {/* Golden Dotted Line */}
              <View className="w-32 h-1">
                <View className="flex-row justify-center">
                  {[...Array(8)].map((_, i) => (
                    <View
                      key={i}
                      className="w-2 h-1 bg-yellow-400 rounded-full mx-1"
                    />
                  ))}
                </View>
              </View>
            </Pressable>
          </Animated.View>

          {/* Back Side */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                backfaceVisibility: 'hidden',
                width: '100%',
              },
              backAnimatedStyle,
            ]}
          >
            <Pressable
              onPress={flipCard}
              className="bg-white rounded-2xl shadow-lg justify-center self-center"
              style={{
                width: 320,
                height: 320,
                padding: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {/* Refresh Button */}
              <Pressable className="absolute top-4 right-4">
                <Ionicons name="refresh" size={20} color="#666" />
              </Pressable>

              {/* Word with Syllables */}
              <View className="flex-row items-center mb-2">
                <View className="flex-row items-center">
                  <Text className="text-red-500 text-lg font-semibold">ad</Text>
                  <Text className="text-gray-400 text-sm mx-1">•</Text>
                  <Text className="text-black text-lg font-semibold">vent</Text>
                  <Text className="text-gray-400 text-sm mx-1">•</Text>
                  <Text className="text-green-500 text-lg font-semibold">ure</Text>
                </View>
                <Pressable className="ml-3">
                  <Ionicons name="volume-high" size={16} color="#666" />
                </Pressable>
              </View>

              {/* Pronunciation */}
              <Text className="text-gray-600 text-sm mb-3">
                /əd'ven(t)SHər/
              </Text>

              {/* Word Type */}
              <Text className="text-gray-500 text-sm absolute top-4 left-6">
                noun
              </Text>

              {/* Translation */}
              <Text className="text-black text-lg font-medium mb-3">
                Chuyến phiêu lưu, mạo hiểm
              </Text>

              {/* Example */}
              <Text className="text-gray-500 text-sm mb-6">
                Her recent adventures in Italy.
              </Text>

              {/* Anatomy Section */}
              <View>
                <Text className="text-black font-bold text-base mb-3">
                  Anatomy
                </Text>
                
                {/* Prefix */}
                <View className="flex-row items-center mb-2">
                  <View className="flex-row items-center w-40">
                    <View className="bg-red-500 rounded-l-full px-3 py-1 w-[60px]">
                      <Text className="text-white text-xs font-medium text-center">Prefix</Text>
                    </View>
                    <Text className="ml-3 text-sm font-semibold text-black">ad-</Text>
                  </View>
                  <Text className="flex-1 ml-8 text-sm text-gray-600 text-left">Hướng đến</Text>
                </View>

                {/* Origin */}
                <View className="flex-row items-center mb-2">
                  <View className="flex-row items-center w-40">
                    <View className="bg-black rounded-l-full px-3 py-1 w-[60px]">
                      <Text className="text-white text-xs font-medium text-center">Origin</Text>
                    </View>
                    <Text className="ml-3 text-sm font-semibold text-black">-vent-</Text>
                  </View>
                  <Text className="flex-1 ml-8 text-sm text-gray-600 text-left">Đi</Text>
                </View>

                {/* Postfix */}
                <View className="flex-row items-center">
                  <View className="flex-row items-center w-40">
                    <View className="bg-green-500 rounded-l-full px-3 py-1 w-[60px]">
                      <Text className="text-white text-xs font-medium text-center">Postfix</Text>
                    </View>
                    <Text className="ml-3 text-sm font-semibold text-black">-ure</Text>
                  </View>
                  <Text className="flex-1 ml-8 text-sm text-gray-600 text-left">hậu tố</Text>
                </View>
              </View>
            </Pressable>
          </Animated.View>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default Flashcard;
