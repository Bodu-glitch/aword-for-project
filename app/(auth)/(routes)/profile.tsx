import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const logout = async () => {
    await supabase.auth.signOut();
  };

  const StatCard = ({ icon, value, label, iconColor }: { 
    icon: string; 
    value: string; 
    label: string; 
    iconColor: string; 
  }) => (
    <View className="bg-white border border-gray-200 rounded-xl p-4 flex-1 mx-1">
      <View className="flex-row items-center">
        <Ionicons name={icon as any} size={24} color={iconColor} />
        <View className="ml-3">
          <Text className="text-2xl font-bold text-black">{value}</Text>
          <Text className="text-sm text-gray-500">{label}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header with Orange Background */}
      <View className="bg-orange-300 pt-4 pb-20 px-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable onPress={() => router.push("/home")}>
              <Ionicons name="arrow-back" size={24} color="black" />
            </Pressable>
            <Text className="text-xl font-semibold text-black ml-4">Profile</Text>
          </View>
          <Pressable onPress={logout}>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </Pressable>
        </View>
        
        {/* Avatar - Centered and overlapping */}
        <View className="items-center">
          <View className="w-24 h-24 rounded-full items-center justify-center">
            <Image
              source={{ uri: "https://i.pravatar.cc/100" }}
              className="w-20 h-20 rounded-full"
            />
          </View>
        </View>
      </View>

      {/* User Information */}
      <View className="bg-white px-6 pt-4 pb-6 flex flex-col items-start">
        <Text className="text-3xl font-semibold text-black text-center mb-2">hhaoz</Text>
        <View className="flex-row items-center justify-center">
          <Text className="text-gray-500 text-base">@hhaoz</Text>
          <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
          <Text className="text-gray-500 text-base">Joined at May 7th 2025</Text>
        </View>
      </View>

      {/* Statistics Section */}
      <View className="flex-1 px-6">
        <Text className="text-xl font-bold text-black mb-4">Statistics</Text>
        
        {/* Statistics Grid */}
        <View className="flex-1">
          {/* Top Row */}
          <View className="flex-row mb-3">
            <StatCard 
              icon="flame" 
              value="20" 
              label="Streaks" 
              iconColor="#FF6B35" 
            />
            <StatCard 
              icon="flash" 
              value="1234" 
              label="Total exp" 
              iconColor="#FFD23F" 
            />
          </View>
          
          {/* Bottom Row */}
          <View className="flex-row">
            <StatCard 
              icon="diamond" 
              value="Gold" 
              label="Current league" 
              iconColor="#FFD700" 
            />
            <StatCard 
              icon="trophy" 
              value="20" 
              label="Top 1 finishes" 
              iconColor="#FFD700" 
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Profile;
