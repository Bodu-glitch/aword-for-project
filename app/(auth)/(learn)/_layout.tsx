import { useAuthContext } from "@/hooks/AuthContext";
import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { FormField } from "heroui-native";
import { useColorScheme } from "nativewind";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { clearQuery, setQuery } from "@/lib/features/search/searchSlice";
import { useAppDispatch } from "@/lib/hooks";

const LearnLayout = () => {
  const router = useRouter();
  const { session } = useAuthContext();
  const { colorScheme } = useColorScheme();
  const [searchValue, setSearchValue] = useState("");

  const colors = getColors(colorScheme === "dark");
  const dispatch = useAppDispatch();

  const handleSearch = (query: string) => {
    if (query.trim().length > 0) {
      dispatch(setQuery(query));
    } else {
      dispatch(clearQuery());
    }
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.text.header,
        headerTitleStyle: { color: colors.text.header },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginLeft: 12 }}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.header} />
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="wordex"
        options={{
          header: () => (
            <View
              style={{
                backgroundColor: colors.background.primary,
                paddingTop: 50,
              }}
            >
              <View
                style={{
                  backgroundColor: colors.primary.main,
                  paddingHorizontal: 12,
                  paddingTop: 40,
                  paddingBottom: 30,
                  flexDirection: "row",
                  alignItems: "center",
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                }}
              >
                {/* Nút back */}
                <TouchableOpacity onPress={() => router.back()}>
                  <Ionicons
                    name="arrow-back"
                    size={22}
                    color={colors.text.header}
                  />
                </TouchableOpacity>

                {/* Ô search */}
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <FormField
                    isSelected={!!searchValue}
                    onSelectedChange={(isSelected) => {
                      if (!isSelected) setSearchValue("");
                    }}
                  >
                    <FormField.Content>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          backgroundColor: colors.surface.primary,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: colors.border.secondary,
                          paddingHorizontal: 12,
                          paddingVertical: 12,
                        }}
                      >
                        <Ionicons
                          name="search"
                          size={18}
                          color={colors.text.secondary}
                          style={{ marginRight: 8 }}
                        />
                        <TextInput
                          value={searchValue}
                          onChangeText={setSearchValue}
                          onSubmitEditing={() => handleSearch(searchValue)}
                          returnKeyType="search"
                          style={{
                            flex: 1,
                            fontSize: 16,
                            color: colors.text.primary,
                          }}
                          placeholder="Search here..."
                          placeholderTextColor={colors.text.tertiary}
                        />
                      </View>
                    </FormField.Content>
                  </FormField>
                </View>
              </View>
            </View>
          ),
        }}
      />

      <Stack.Protected guard={!!session}>
        <Stack.Screen name="flashcard" options={{ title: "Flashcard" }} />
        <Stack.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
      </Stack.Protected>
    </Stack>
  );
};

export default LearnLayout;
