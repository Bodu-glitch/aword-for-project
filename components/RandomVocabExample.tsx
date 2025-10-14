// filepath: /home/bo/repos/Aword/components/RandomVocabExample.tsx
import React from "react";
import { View, Text, ActivityIndicator, Button } from "react-native";
import { useGetRandomVocabularyQuery } from "@/lib/features/vocab/vocabApi";

export default function RandomVocabExample() {
  const { data, error, isFetching, refetch } = useGetRandomVocabularyQuery();

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: "600" }}>Random Vocabulary</Text>
      {isFetching && <ActivityIndicator />}
      {error && (
        <Text style={{ color: "red" }}>
          {"message" in (error as any)
            ? (error as any).message
            : "Failed to load vocabulary"}
        </Text>
      )}
      {data ? (
        <View>
          <Text style={{ fontSize: 16 }}>{data.word}</Text>
          {data.definition_vi ? (
            <Text style={{ color: "#555" }}>{data.definition_vi}</Text>
          ) : null}
        </View>
      ) : (
        !isFetching && <Text>Tap refresh to get a word</Text>
      )}
      <Button title="Refresh" onPress={() => refetch()} />
    </View>
  );
}
