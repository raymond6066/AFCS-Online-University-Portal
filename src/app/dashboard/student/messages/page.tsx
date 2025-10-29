"use client";

import { PlaceholderChat } from "@/components/chat/PlaceholderChat";
import { RoleDashboard } from "@/components/layout/RoleDashboard";

export default function StudentMessagesPage() {
  return (
    <RoleDashboard role="STUDENT" title="Messages">
      <PlaceholderChat title="Student support chat" />
    </RoleDashboard>
  );
}
