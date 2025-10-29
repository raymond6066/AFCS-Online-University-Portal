"use client";

import { ProfileForm } from "../../../../components/forms/ProfileForm";
import { LoadingState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";

export default function StudentProfilePage() {
  const auth = useCurrentUserProfile();

  if (auth.loading || !auth.profile) {
    return <LoadingState label="Loading profile..." />;
  }

  return (
    <ProfileForm
      cognitoSub={auth.profile.cognitoSub}
      email={auth.profile.email}
      existingProfile={auth.profile}
      availableRoles={[auth.profile.role]}
    />
  );
}
