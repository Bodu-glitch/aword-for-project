import React from "react";
import {SafeAreaView} from "react-native-safe-area-context";
import {Image, Pressable, Text, View} from "react-native";
import {Link} from "expo-router";
import {Ionicons, MaterialCommunityIcons} from "@expo/vector-icons";

const Home = () => {
    return (
        <SafeAreaView className="flex-1 bg-white px-5 pt-10">
            {/* Header */}
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                    <Image
                        source={{uri: "https://i.pravatar.cc/100"}}
                        className="w-10 h-10 rounded-full mr-2"
                    />
                    <Text className="text-base font-semibold">hhaoz</Text>
                </View>

                <View className="flex-row">
                    <Link href={"/profile"} asChild>
                        <Pressable className="ml-2">
                            <Ionicons name="person-circle-outline" size={24} color="black"/>
                        </Pressable>
                    </Link>
                    <Link href={"/setting"} asChild>
                        <Pressable className="ml-2">
                            <Ionicons name="settings-outline" size={24} color="black"/>
                        </Pressable>
                    </Link>
                </View>
            </View>

            {/* Streak */}
            <View className="flex-row items-center mt-4 self-end">
                <Ionicons name="flame-outline" size={24} color="orange"/>
                <Text className="ml-1 text-orange-500 font-semibold text-xl">20 streak</Text>
            </View>

            {/* Title */}
            <Text className="text-4xl font-semibold text-gray-600 my-6 text-right">
                30 words
            </Text>

            {/* Menu buttons */}
            <Link href={"/learning"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-4">
                    <MaterialCommunityIcons
                        name="book-open-page-variant"
                        size={38}
                        color="white"
                    />
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-2xl">Learning</Text>
                        <Text className="text-blue-200 text-sm">lesson #20</Text>
                    </View>
                </Pressable>
            </Link>

            <Link href={"/flashcard"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-4">
                    <MaterialCommunityIcons name="cards-outline" size={38} color="white"/>
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-2xl">Flashcard</Text>
                        <Text className="text-blue-200 text-sm">No. of card 30</Text>
                    </View>
                </Pressable>
            </Link>

            <Link href={"/wordex"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-4">
                    <Ionicons name="search-outline" size={38} color="white"/>
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-2xl">Wordex</Text>
                        <Text className="text-blue-200 text-sm">Looking for a word</Text>
                    </View>
                </Pressable>
            </Link>

            <Link href={"/leaderboard"} asChild>
                <Pressable className="flex-row items-center bg-blue-600 rounded-xl p-5 mb-4">
                    <Ionicons name="bar-chart-outline" size={38} color="white"/>
                    <View className="ml-5">
                        <Text className="text-white font-semibold text-2xl">Leaderboard</Text>
                        <Text className="text-blue-200 text-sm">Your learning rank</Text>
                    </View>
                </Pressable>
            </Link>
        </SafeAreaView>
    );
};

export default Home;
