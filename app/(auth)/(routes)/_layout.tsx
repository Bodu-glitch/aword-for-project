import React from "react";
import { View } from "react-native";
import { Tabs } from "expo-router";

const RoutesLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: { display: "none" },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="setting"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default RoutesLayout;
