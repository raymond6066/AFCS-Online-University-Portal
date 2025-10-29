"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, fetchAuthSession, signOut } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { client } from "../lib/amplifyClient";
import type { UserProfile, UserRole } from "../lib/schema";
import { DASHBOARD_ROUTE, isRole } from "../lib/roles";

export type AuthState = {
  loading: boolean;
  profile: UserProfile | null;
  role: UserRole | null;
  refresh: () => Promise<void>;
  signOutAndRedirect: () => Promise<void>;
};

const initialState: AuthState = {
  loading: true,
  profile: null,
  role: null,
  refresh: async () => undefined,
  signOutAndRedirect: async () => undefined,
};

export function useCurrentUserProfile(): AuthState {
  const router = useRouter();
  const [state, setState] = useState(initialState);

  const loadProfile = useCallback(async () => {
    try {
      await fetchAuthSession();
      const current = await getCurrentUser();
      const cognitoSub = current.userId;
      const result = await client.models.UserProfile.list({
        filter: {
          cognitoSub: { eq: cognitoSub },
        },
      });

      const profile = result.data[0] ?? null;
      const role = profile?.role ?? null;
      setState((prev) => ({
        ...prev,
        loading: false,
        profile,
        role: role && isRole(role) ? role : null,
      }));
    } catch (error) {
      console.warn("No authenticated user", error);
      setState((prev) => ({ ...prev, loading: false, profile: null, role: null }));
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const signOutAndRedirect = useCallback(async () => {
    await signOut();
    router.replace("/");
  }, [router]);

  return useMemo(
    () => ({
      loading: state.loading,
      profile: state.profile,
      role: state.role,
      refresh: loadProfile,
      signOutAndRedirect,
    }),
    [state.loading, state.profile, state.role, loadProfile, signOutAndRedirect]
  );
}

export function useRequireRole(allowedRoles: UserRole[]) {
  const auth = useCurrentUserProfile();
  const router = useRouter();
  const allowedKey = allowedRoles.slice().sort().join(",");

  useEffect(() => {
    if (!auth.loading) {
      if (!auth.profile || !auth.role) {
        router.replace("/login");
        return;
      }
      if (!allowedRoles.includes(auth.role)) {
        const fallback = auth.role ? DASHBOARD_ROUTE[auth.role] : "/";
        router.replace(fallback);
      }
    }
  }, [allowedKey, auth, router, allowedRoles.length]);

  return auth;
}
