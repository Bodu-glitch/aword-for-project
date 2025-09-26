import { Stack } from "expo-router";
import "./global.css";
import { vars, useColorScheme } from "nativewind";
import { View } from "react-native";
import { Provider } from "react-redux";
import { makeStore, AppStore } from "@/lib/store";
import React from "react";
import AuthProvider from "@/providers/auth-provider";
import { SplashScreenController } from "@/components/splash-screen-controller";

const themes = {
  blue: {
    light: vars({
      "--color-primary": "6 89 231",
    }),
    dark: vars({
      "--color-primary": "96 165 250",
    }),
  },
};

function Theme(props: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  return (
    <View
      style={
        colorScheme === "dark"
          ? themes["blue"]["dark"]
          : themes["blue"]["light"]
      }
      className={"flex-1 bg-primary"}
    >
      {props.children}
    </View>
  );
}

function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = React.useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

export default function RootLayout() {
  return (
    <StoreProvider>
      <Theme>
        <AuthProvider>
          <SplashScreenController />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </Theme>
    </StoreProvider>
  );
}
