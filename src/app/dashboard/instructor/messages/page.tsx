"use client";

import { PlaceholderChat } from "@/components/chat/PlaceholderChat";
import { RoleDashboard } from "@/components/layout/RoleDashboard";

export default function InstructorMessagesPage() {
  return (
    <RoleDashboard role="INSTRUCTOR" title="Messages">
      <PlaceholderChat title="Instructor communications" />
    </RoleDashboard>
  );
}
