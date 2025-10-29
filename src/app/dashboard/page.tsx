"use client";

import { useEffect } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { client } from "../../lib/amplifyClient";
import { DASHBOARD_ROUTE, isRole } from "../../lib/roles";
import { LoadingState } from "../../components/ui/StateBlocks";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const route = async () => {
      try {
        const user = await getCurrentUser();
        const result = await client.models.UserProfile.list({
          filter: { cognitoSub: { eq: user.userId } },
        });
        const profile = result.data[0];
        if (profile && isRole(profile.role)) {
          router.replace(DASHBOARD_ROUTE[profile.role]);
        } else {
          router.replace("/signup");
        }
      } catch (err) {
        console.error(err);
        router.replace("/login");
      }
    };
    route();
  }, [router]);

  return <LoadingState label="Redirecting to your dashboard..." />;
}
