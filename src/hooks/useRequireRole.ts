"use client";

import { useAuthContext } from "@/context/AuthContext";
import type { Role } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useRequireRole = (role: Role) => {
  const router = useRouter();
  const { loading, user, role: currentRole, signIn } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        void signIn();
      } else if (currentRole && currentRole !== role) {
        router.replace(`/dashboard/${currentRole.toLowerCase()}`);
      }
    }
  }, [currentRole, loading, role, router, signIn, user]);

  return { loading, user, currentRole };
};
