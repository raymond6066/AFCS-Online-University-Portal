"use client";

import { client } from "@/lib/amplifyClient";
import type { Role, UserProfile } from "@/types";
import { fetchAuthSession, getCurrentUser, signInWithRedirect } from "aws-amplify/auth";
import { useCallback, useEffect, useMemo, useState } from "react";

interface UseAmplifyUserResult {
  loading: boolean;
  user: UserProfile | null;
  role: Role | null;
  refresh: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAmplifyUser(): UseAmplifyUserResult {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      await fetchAuthSession();
      const current = await getCurrentUser();
      const { data } = await client.models.UserProfile.list({
        filter: { cognitoSub: { eq: current.userId } },
      });

      if (data && data.length > 0) {
        const profile = data[0] as unknown as UserProfile;
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const signIn = useCallback(async () => {
    await signInWithRedirect({ provider: "COGNITO" });
  }, []);

  const signOut = useCallback(async () => {
    const { signOut: amplifySignOut } = await import("aws-amplify/auth");
    await amplifySignOut();
    setUserProfile(null);
  }, []);

  return useMemo(
    () => ({
      loading,
      user: userProfile,
      role: userProfile?.role ?? null,
      refresh: loadProfile,
      signIn,
      signOut,
    }),
    [loadProfile, loading, signIn, signOut, userProfile]
  );
}
