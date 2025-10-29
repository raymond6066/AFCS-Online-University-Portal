"use client";

import { AcademicCapIcon, CalendarDaysIcon, ClipboardDocumentListIcon, MegaphoneIcon, UserGroupIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { LoadingState } from "../../../components/ui/StateBlocks";
import { useRequireRole } from "../../../hooks/useCurrentUserProfile";

const NAV_ITEMS = [
  { href: "/dashboard/instructor", label: "Overview", icon: <AcademicCapIcon className="h-5 w-5" /> },
  { href: "/dashboard/instructor/courses", label: "My Courses", icon: <UserGroupIcon className="h-5 w-5" /> },
  { href: "/dashboard/instructor/assignments", label: "Assignments", icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
  { href: "/dashboard/instructor/attendance", label: "Attendance", icon: <CalendarDaysIcon className="h-5 w-5" /> },
  { href: "/dashboard/instructor/gradebook", label: "Gradebook", icon: <ChartBarIcon className="h-5 w-5" /> },
  { href: "/dashboard/instructor/announcements", label: "Announcements", icon: <MegaphoneIcon className="h-5 w-5" /> },
  { href: "/dashboard/instructor/messages", label: "Messages", icon: <MegaphoneIcon className="h-5 w-5" /> },
];

export default function InstructorDashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useRequireRole(["INSTRUCTOR"]);

  if (auth.loading || !auth.profile || !auth.role) {
    return <LoadingState label="Loading instructor workspace..." />;
  }

  return (
    <DashboardLayout
      title="Instructor Dashboard"
      nav={NAV_ITEMS}
      role={auth.role}
      profile={auth.profile}
    >
      {children}
    </DashboardLayout>
  );
}
