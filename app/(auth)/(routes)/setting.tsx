import React from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";

const Setting = () => {
  const { toggleColorScheme } = useColorScheme();

  return (
    <SafeAreaView>
      <Text className={"text-primary"}>Setting Page</Text>
      <Button title={"switch theme"} onPress={toggleColorScheme} />
    </SafeAreaView>
  );
};

export default Setting;
