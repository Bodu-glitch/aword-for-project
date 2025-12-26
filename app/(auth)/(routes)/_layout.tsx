import { Tabs } from "expo-router";
import React from "react";

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
        name="learning"
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
      <Tabs.Screen
        name="admin"
        options={{
          headerShown: false,
        }}
      />
    </Tabs>
  );
};

export default RoutesLayout;
