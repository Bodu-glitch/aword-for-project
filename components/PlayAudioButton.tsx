import { supabase } from "@/lib/supabase";
import { getColors } from "@/utls/colors";
import { Ionicons } from "@expo/vector-icons";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import { useColorScheme } from "nativewind";
import React, { useEffect } from "react";
import { Pressable } from "react-native";

const convertPathToAudioUrl = (path: string) => {
  if (!path) return "";
  const { data } = supabase.storage.from("audios").getPublicUrl(path);
  return data.publicUrl;
};

const PlayAudioButton = ({
  audioPath,
  autoPlay = false,
}: {
  audioPath: string;
  autoPlay?: boolean;
}) => {
  const { colorScheme } = useColorScheme();
  const colors = getColors(colorScheme === "dark");
  const player = useAudioPlayer(convertPathToAudioUrl(audioPath));
  player.volume = 1.0;

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
    });
  }, []);

  useEffect(() => {
    if (!audioPath) return;
    player.replace(convertPathToAudioUrl(audioPath));
  }, [audioPath, player]);

  // Auto-play when requested. We delay to next frame so replace() from the
  // other effect has a chance to run and set the source.
  useEffect(() => {
    if (!audioPath || !autoPlay) return;
    let mounted = true;
    requestAnimationFrame(async () => {
      if (!mounted) return;
      try {
        await player.seekTo(0);
        player.play();
      } catch (e) {
        // Non-blocking: player may not be ready instantly.
        console.warn("PlayAudioButton autoPlay failed:", e);
      }
    });
    return () => {
      mounted = false;
    };
  }, [audioPath, autoPlay, player]);

  return (
    <Pressable
      className="ml-1 relative bg-red"
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
