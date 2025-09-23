import { Stack } from "expo-router";
import "./global.css";
import { vars, useColorScheme } from "nativewind";
import { View } from "react-native";

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

export default function RootLayout() {
  return (
    <Theme>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </Theme>
  );
}
