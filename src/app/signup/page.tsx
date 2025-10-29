"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "aws-amplify/auth";
import { useRouter } from "next/navigation";
import { ProfileForm } from "../../components/forms/ProfileForm";
import { client } from "../../lib/amplifyClient";
import { DASHBOARD_ROUTE, isRole } from "../../lib/roles";
import type { UserProfile, UserRole } from "../../lib/schema";
import { LoadingState, ErrorState } from "../../components/ui/StateBlocks";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cognitoSub, setCognitoSub] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>(["STUDENT", "INSTRUCTOR"]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const current = await getCurrentUser();
        setCognitoSub(current.userId);
        setEmail(current.signInDetails?.loginId ?? "");
        const profileResult = await client.models.UserProfile.list({
          filter: { cognitoSub: { eq: current.userId } },
        });
        const existingProfile = profileResult.data[0] ?? null;
        if (existingProfile && isRole(existingProfile.role)) {
          router.replace(DASHBOARD_ROUTE[existingProfile.role]);
          return;
        }
        setProfile(existingProfile);
        const firstUserCheck = await client.models.UserProfile.list({ limit: 1 });
        if (firstUserCheck.data.length === 0) {
          setRoles(["ADMIN", "INSTRUCTOR", "STUDENT"]);
        }
      } catch (err) {
        console.error(err);
        router.replace("/login");
        return;
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [router]);

  if (loading) {
    return <LoadingState label="Preparing signup..." />;
  }

  if (!cognitoSub || !email) {
    return <ErrorState message="We could not find your authentication details." />;
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-4 py-16">
      <ProfileForm cognitoSub={cognitoSub} email={email} existingProfile={profile} availableRoles={roles} />
    </main>
  );
}
