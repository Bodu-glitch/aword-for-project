import { SplashScreenController } from "@/components/SplashScreenController";
import { AppStore, makeStore } from "@/lib/store";
import AuthProvider from "@/providers/AuthProvider";
import { Stack } from "expo-router";
import { HeroUINativeProvider } from "heroui-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { Provider } from "react-redux";
import { StatusBar } from "expo-status-bar";
import "./global.css";
import Toast from "react-native-toast-message";

function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = React.useRef<AppStore | null>(null);
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}

function HeroUIProvider({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();

  return (
    <HeroUINativeProvider config={{ colorScheme: colorScheme || "light" }}>
      {children}
    </HeroUINativeProvider>
  );
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  return (
    <HeroUIProvider>
      <StatusBar style="auto" />
      <StoreProvider>
        <AuthProvider>
          <SplashScreenController />
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          </Stack>
          <Toast />
        </AuthProvider>
      </StoreProvider>
    </HeroUIProvider>
  );
}
