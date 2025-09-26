import Auth from "@/components/Auth";
import { useAppSelector } from "@/lib/hooks";
import { Link } from "expo-router";
import { Button, Text, View } from "react-native";

export default function Index() {
  const user = useAppSelector((state) => state.auth.auth);

  return (
    <View className={"flex-1 items-center justify-center bg-background px-4"}>
      {!user?.userId ? (
        <Auth />
      ) : (
        <Text className={"text-lg"}>Welcome, {user.name}</Text>
      )}
      <Text className={"text-2xl text-primary"}>Login</Text>
      <Link href={"/home"} asChild>
        <Button title={"Sign In"} onPress={() => {}} />
      </Link>
      <Link href={"/wordex"} asChild>
        <Button title={"Search"} onPress={() => {}} />
      </Link>
    </View>
  );
}
