"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { LoadingState } from "@/components/feedback/LoadingState";
import { useRequireRole } from "@/hooks/useRequireRole";
import { adminLinks, instructorLinks, studentLinks } from "@/utils/navLinks";
import type { Role } from "@/types";
import type { ReactNode } from "react";
import { DashboardShell } from "./DashboardShell";

interface RoleDashboardProps {
  role: Role;
  title: string;
  children: ReactNode;
}

const roleConfig = {
  STUDENT: { links: studentLinks, sidebar: "Student Portal" },
  INSTRUCTOR: { links: instructorLinks, sidebar: "Instructor Portal" },
  ADMIN: { links: adminLinks, sidebar: "Admin Portal" },
} as const;

export const RoleDashboard = ({ role, title, children }: RoleDashboardProps) => {
  const { loading, user, currentRole } = useRequireRole(role);

  if (loading || !user || !currentRole) {
    return <LoadingState message="Preparing your workspace..." />;
  }

  if (currentRole !== role) {
    return (
      <ErrorState
        message="You do not have permission to access this dashboard."
        onRetry={() => window.location.assign(`/dashboard/${currentRole.toLowerCase()}`)}
      />
    );
  }

  const config = roleConfig[role];

  return (
    <DashboardShell sidebarTitle={config.sidebar} navLinks={config.links} pageTitle={title}>
      {children}
    </DashboardShell>
  );
};
