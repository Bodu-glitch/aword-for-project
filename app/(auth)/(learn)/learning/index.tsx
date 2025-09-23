import React from "react";
import { Button, Text, View } from "react-native";
import { Link } from "expo-router";

const Index = () => {
  return (
    <View>
      <Text>learning</Text>

      <Link href={"/learning/overview"} asChild>
        <Button title={"Overview"} onPress={() => {}} />
      </Link>
    </View>
  );
};

export default Index;
