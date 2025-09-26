import React from "react";
import { Stack } from "expo-router";
import { useAppDispatch } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { clearAuth, setAuth } from "@/lib/features/auth/authSlice";
import { useAuthContext } from "@/hooks/use-auth-context";

const MainLayout = () => {
  const { session } = useAuthContext();

  return (
    <Stack>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(routes)" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Screen name="(learn)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default MainLayout;
