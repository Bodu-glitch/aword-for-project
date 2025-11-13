import { supabase } from "@/lib/supabase";
import { useColorScheme } from "nativewind";
import { getColors } from "@/utls/colors";
import { useAudioPlayer } from "expo-audio";
import React, { useEffect } from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const convertPathToAudioUrl = (path: string) => {
  if (!path) return "";
  const { data } = supabase.storage.from("audios").getPublicUrl(path);
  return data.publicUrl;
};

const PlayAudioButton = ({ audioPath }: { audioPath: string }) => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const player = useAudioPlayer(convertPathToAudioUrl(audioPath));

  useEffect(() => {
    if (!audioPath) return;
    player.replace(convertPathToAudioUrl(audioPath));
  }, [audioPath, player]);

  return (
    <Pressable
      className="ml-1 relative z-21 bg-red"
      style={{ zIndex: 21 }}
      onPress={async (event) => {
        event.preventDefault();
        await player.seekTo(0);
        player.play();
      }}
    >
      <Ionicons name="volume-high" size={20} color={colors.text.secondary} />
    </Pressable>
  );
};

export default PlayAudioButton;
