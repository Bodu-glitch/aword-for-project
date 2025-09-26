import Auth from "@/components/Auth";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Button, Pressable, Text, View } from "react-native";

export default function Index() {
  return (
    <View className={"flex-1 items-center justify-center bg-white px-4"}>
      {/* New Login Card */}
      <View className="bg-white rounded-2xl p-8 w-full">
        <Text className="text-2xl font-bold text-black text-center mb-8">
          Log in to better English every day!
        </Text>
        
        <View className="flex-col items-center justify-center gap-4">
          <Auth></Auth>
          
          {/* Apple Login Button */}
          <Pressable className="flex-row items-center justify-center bg-white border border-gray-300 rounded-xl py-4 px-20">
            <Ionicons name="logo-apple" size={24} color="black" style={{ marginRight: 14 }} />
            <Text className="text-black text-lg font-medium text-base">Login with Apple</Text>
          </Pressable>
        </View>
      </View>
      
      {/* Existing Items */}
      <View className="mt-8">
        <Link href={"/home"} asChild>
          <Button title={"Sign In"} onPress={() => {}} />
        </Link>
      </View>
    </View>
  );
}
