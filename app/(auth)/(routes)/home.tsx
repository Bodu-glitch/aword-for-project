import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
    const flameAnimation = useRef<LottieView>(null);
    const gradientAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        flameAnimation.current?.play();
        
        // Gradient animation
        const animateGradient = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(gradientAnimation, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                    Animated.timing(gradientAnimation, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: false,
                    }),
                ])
            ).start();
        };
        animateGradient();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <Pressable onPress={() => router.push("/profile")} className="flex-row items-center">
                    <Image
                        source={{uri: "https://i.pravatar.cc/100"}}
                        className="w-14 h-14 rounded-full mr-3"
                    />
                    <Text className="text-xl font-semibold">hhaoz</Text>
                </Pressable>

                <View className="flex-row">
                    <Link href={"/setting"} asChild>
                        <Pressable className="ml-3">
                            <Ionicons name="settings-outline" size={32} color="black"/>
                        </Pressable>
                    </Link>
                </View>
            </View>

            {/* Streak */}
            <View className="flex-row items-center mt-6 self-end">
                <LottieView
                    ref={flameAnimation}
                    autoPlay
                    loop
                    style={{
                        width: 40,
                        height: 40,
                    }}
                    source={require('../../../assets/animations/streak-fire.json')}
                />
                <Animated.Text 
                    className="ml-2 font-semibold text-2xl"
                    style={{
                        color: gradientAnimation.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: ['#FF6B35', '#FFD23F', '#FF6B35'],
                        }),
                    }}
                >
                    20 streak
                </Animated.Text>
            </View>

            {/* Title */}
            <Text className="text-5xl font-semibold text-gray-600 my-8 text-right">
                30 words
            </Text>

            {/* Menu buttons */}
            <Link href={"/learning"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-6">
                    <MaterialCommunityIcons
                        name="book-open-page-variant"
                        size={48}
                        color="white"
                    />
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-3xl">Learning</Text>
                        <Text className="text-blue-200 text-lg">lesson #20</Text>
                    </View>
                </Pressable>
            </Link>

            <Link href={"/flashcard"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-6">
                    <MaterialCommunityIcons name="cards-outline" size={48} color="white"/>
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-3xl">Flashcard</Text>
                        <Text className="text-blue-200 text-lg">No. of card 30</Text>
                    </View>
                </Pressable>
            </Link>

            <Link href={"/wordex"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-6">
                    <Ionicons name="search-outline" size={48} color="white"/>
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-3xl">Wordex</Text>
                        <Text className="text-blue-200 text-lg">Looking for a word</Text>
                    </View>
                </Pressable>
            </Link>

            <Link href={"/leaderboard"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-6">
                    <Ionicons name="ribbon-outline" size={48} color="white"/>
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-3xl">Leaderboard</Text>
                        <Text className="text-blue-200 text-lg">Your learning rank</Text>
                    </View>
                </Pressable>
            </Link>
        </SafeAreaView>
    );
};

export default Home;
