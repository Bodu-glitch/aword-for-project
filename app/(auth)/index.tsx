import { expo } from "@/app.json";
import { useAppSelector } from "@/lib/hooks";
import { supabase } from "@/lib/supabase";
import { getColors } from "@/utls/colors";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const user = useAppSelector((state) => state.auth.auth);
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");

  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  function extractParamsFromUrl(url: string) {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash.substring(1);
    const params = new URLSearchParams(hash);

    return {
      access_token: params.get("access_token"),
      expires_in: parseInt(params.get("expires_in") || "0"),
      refresh_token: params.get("refresh_token"),
      token_type: params.get("token_type"),
      provider_token: params.get("provider_token"),
      code: params.get("code"),
    };
  }

  async function onSignInButtonPress() {
    console.debug("onSignInButtonPress - start");
    const res = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${expo.scheme}://home`,
        queryParams: { prompt: "consent" },
        skipBrowserRedirect: true,
      },
    });

    const googleOAuthUrl = res.data.url;

    if (!googleOAuthUrl) {
      console.error("no oauth url found!");
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      googleOAuthUrl,
      `${expo.scheme}://home`,
      { showInRecents: true }
    ).catch((err) => {
      console.error("onSignInButtonPress - openAuthSessionAsync - error", {
        err,
      });
    });

    if (result && result.type === "success") {
      const params = extractParamsFromUrl(result.url);

      if (params.access_token && params.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });

        if (!error) {
          router.replace("/home");
          return;
        }
      }
    }
  }

  if (user?.userId) {
    return (
      <View className={"flex-1 items-center justify-center bg-background px-4"}>
        <Text className={"text-lg"}>Welcome, {user.name}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.primary }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Quote Text */}
        <Text
          className="text-center text-xl mb-8 px-4"
          style={{ 
            color: colors.text.primary,
            fontSize: 20,
            lineHeight: 28,
          }}
        >
          "Log in to unlock powerful features that help you practice and improve
          your English every day!"
        </Text>

        {/* Character Illustration */}
        <View className="mb-8" style={{ width: 280, height: 280 }}>
          <Image
            source={require("@/assets/images/login-icon.png")}
            style={{
              width: "100%",
              height: "100%",
            }}
            contentFit="contain"
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={onSignInButtonPress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.background.primary,
            borderWidth: 1,
            borderColor: colors.border.primary,
            borderRadius: 12,
            paddingVertical: 14,
            paddingHorizontal: 80,
            minWidth: 280,
            justifyContent: "center",
            elevation: 2,
          }}
          activeOpacity={0.8}
        >
          <Image
            source={{
              uri: "https://developers.google.com/identity/images/g-logo.png",
            }}
            style={{ width: 24, height: 24, marginRight: 10 }}
          />
          <Text
            style={{
              fontSize: 16,
              color: colors.text.primary,
              fontWeight: "500",
            }}
          >
            Sign in with Google
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
