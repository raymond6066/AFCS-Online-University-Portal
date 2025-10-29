"use client";

import { useAuthContext } from "@/context/AuthContext";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardEntry() {
  const router = useRouter();
  const { loading, role, user, signIn } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        void signIn();
      } else if (role) {
        router.replace(`/dashboard/${role.toLowerCase()}`);
      } else {
        router.replace("/signup");
      }
    }
  }, [loading, role, router, signIn, user]);

  return <LoadingState message="Redirecting to your dashboard..." />;
}
