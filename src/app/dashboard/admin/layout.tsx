"use client";

import { AcademicCapIcon, ClipboardDocumentListIcon, MegaphoneIcon, ShieldCheckIcon, BanknotesIcon, ChartBarIcon, ArchiveBoxIcon } from "@heroicons/react/24/outline";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { LoadingState } from "../../../components/ui/StateBlocks";
import { useRequireRole } from "../../../hooks/useCurrentUserProfile";

const NAV_ITEMS = [
  { href: "/dashboard/admin", label: "Overview", icon: <AcademicCapIcon className="h-5 w-5" /> },
  { href: "/dashboard/admin/users", label: "User Management", icon: <ShieldCheckIcon className="h-5 w-5" /> },
  { href: "/dashboard/admin/payments", label: "Payments", icon: <BanknotesIcon className="h-5 w-5" /> },
  { href: "/dashboard/admin/resources", label: "Resource Booking", icon: <ArchiveBoxIcon className="h-5 w-5" /> },
  { href: "/dashboard/admin/announcements", label: "Announcements", icon: <MegaphoneIcon className="h-5 w-5" /> },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: <ChartBarIcon className="h-5 w-5" /> },
  { href: "/dashboard/admin/documents", label: "Documents", icon: <ClipboardDocumentListIcon className="h-5 w-5" /> },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const auth = useRequireRole(["ADMIN"]);

  if (auth.loading || !auth.profile || !auth.role) {
    return <LoadingState label="Loading admin control center..." />;
  }

  return (
    <DashboardLayout title="Administrator Dashboard" nav={NAV_ITEMS} role={auth.role} profile={auth.profile}>
      {children}
    </DashboardLayout>
  );
}
