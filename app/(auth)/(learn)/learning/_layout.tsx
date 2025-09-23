import React from "react";
import { Stack } from "expo-router";

const LearningLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="overview" options={{ headerShown: false }} />
    </Stack>
  );
};

export default LearningLayout;
