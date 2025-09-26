import { AuthContext } from "@/hooks/use-auth-context";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { PropsWithChildren, useEffect, useState } from "react";
import { clearAuth, setAuth } from "@/lib/features/auth/authSlice";
import { useAppDispatch } from "@/lib/hooks";

export default function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>();
  const [profile, setProfile] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const dispatch = useAppDispatch();

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
      }

      setSession(session);
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // console.log("Auth state changed:", { event: event, session });
      if (event === "INITIAL_SESSION") {
        // handle initial session
        if (session && session.user && session.user.email) {
          dispatch(
            setAuth({
              userId: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata.full_name,
              avatar_url: session.user.user_metadata.avatar_url,
            }),
          );
        }
      } else if (event === "SIGNED_IN") {
        if (session && session.user && session.user.email) {
          dispatch(
            setAuth({
              userId: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata.full_name,
              avatar_url: session.user.user_metadata.avatar_url,
            }),
          );
        }
        // handle sign in event
        console.log(event, session);
      } else if (event === "SIGNED_OUT") {
        // handle sign out event
        dispatch(clearAuth());
      }
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the profile when the session changes
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);

      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(data);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    };

    fetchProfile();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        isLoggedIn: session != undefined,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
