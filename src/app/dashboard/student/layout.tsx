"use client";

import { AcademicCapIcon, CalendarDaysIcon, ClipboardDocumentListIcon, DocumentTextIcon, MegaphoneIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { LoadingState } from "../../../components/ui/StateBlocks";
import { useRequireRole } from "../../../hooks/useCurrentUserProfile";

const NAV_ITEMS = [
  { href: "/dashboard/student", label: "Overview", icon: <AcademicCapIcon className="h-5 w-5" /> },
  { href: "/dashboard/student/courses", label: "Courses", icon: <DocumentTextIcon className="h-5 w-5" /> },
  { href: "/dashboard/student/assignments", label: "Assignments", icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
  { href: "/dashboard/student/grades", label: "Grades", icon: <UserCircleIcon className="h-5 w-5" /> },
  { href: "/dashboard/student/schedule", label: "Schedule", icon: <CalendarDaysIcon className="h-5 w-5" /> },
  { href: "/dashboard/student/announcements", label: "Announcements", icon: <MegaphoneIcon className="h-5 w-5" /> },
  { href: "/dashboard/student/messages", label: "Messages", icon: <MegaphoneIcon className="h-5 w-5" /> },
  { href: "/dashboard/student/profile", label: "Profile", icon: <UserCircleIcon className="h-5 w-5" /> },
];

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useRequireRole(["STUDENT"]);

  if (auth.loading || !auth.profile || !auth.role) {
    return <LoadingState label="Loading your student dashboard..." />;
  }

  return (
    <DashboardLayout
      title="Student Officer Dashboard"
      nav={NAV_ITEMS}
      role={auth.role}
      profile={auth.profile}
    >
      {children}
    </DashboardLayout>
  );
}
