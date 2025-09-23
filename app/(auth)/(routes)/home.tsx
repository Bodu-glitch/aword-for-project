import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Text } from "react-native";
import { Link } from "expo-router";

const Home = () => {
  return (
    <SafeAreaView>
      <Link href={"/learning"} asChild>
        <Button title={"Index"} onPress={() => {}} />
      </Link>

      <Link href={"/flashcard"} asChild>
        <Button title={"Flashcard"} onPress={() => {}} />
      </Link>

      <Link href={"/wordex"} asChild>
        <Button title={"Wordex"} onPress={() => {}} />
      </Link>

      <Link href={"/leaderboard"} asChild>
        <Button title={"Leaderboard"} onPress={() => {}} />
      </Link>

      <Link href={"/setting"} asChild>
        <Button title={"Setting"} onPress={() => {}} />
      </Link>

      <Link href={"/profile"} asChild>
        <Button title={""} onPress={() => {}} />
      </Link>
    </SafeAreaView>
  );
};

export default Home;
