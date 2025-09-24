import {Button, Text, View} from "react-native";
import {Link} from "expo-router";

export default function Index() {
    return (
        <View className={"flex-1 items-center justify-center bg-background px-4"}>
            <Text className={"text-2xl text-primary"}>Login</Text>
            <Link href={"/home"} asChild>
                <Button title={"Sign In"} onPress={() => {
                }}/>
            </Link>
            <Link href={"/wordex"} asChild>
                <Button title={"Search"} onPress={() => {
                }}/>
            </Link>
        </View>
    );
}
