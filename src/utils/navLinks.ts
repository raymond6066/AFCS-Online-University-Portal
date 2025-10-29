import type { DashboardNavLink } from "@/types";

export const studentLinks: DashboardNavLink[] = [
  { label: "Overview", href: "/dashboard/student", icon: "🎓" },
  { label: "Courses", href: "/dashboard/student/courses", icon: "📚" },
  { label: "Assignments", href: "/dashboard/student/assignments", icon: "📝" },
  { label: "Grades", href: "/dashboard/student/grades", icon: "📊" },
  { label: "Schedule", href: "/dashboard/student/schedule", icon: "🗓️" },
  { label: "Attendance", href: "/dashboard/student/attendance", icon: "✅" },
  { label: "Announcements", href: "/dashboard/student/announcements", icon: "📢" },
  { label: "Messages", href: "/dashboard/student/messages", icon: "💬" },
  { label: "Profile", href: "/dashboard/student/profile", icon: "👤" },
];

export const instructorLinks: DashboardNavLink[] = [
  { label: "Overview", href: "/dashboard/instructor", icon: "🧑‍🏫" },
  { label: "My Courses", href: "/dashboard/instructor/courses", icon: "📚" },
  { label: "Post Assignment", href: "/dashboard/instructor/assignments", icon: "📝" },
  { label: "Attendance", href: "/dashboard/instructor/attendance", icon: "✅" },
  { label: "Gradebook", href: "/dashboard/instructor/gradebook", icon: "📊" },
  { label: "Announcements", href: "/dashboard/instructor/announcements", icon: "📢" },
  { label: "Messages", href: "/dashboard/instructor/messages", icon: "💬" },
];

export const adminLinks: DashboardNavLink[] = [
  { label: "Analytics", href: "/dashboard/admin", icon: "📈" },
  { label: "User Management", href: "/dashboard/admin/users", icon: "🧑‍💼" },
  { label: "Payments", href: "/dashboard/admin/payments", icon: "💳" },
  { label: "Resource Booking", href: "/dashboard/admin/resources", icon: "🛠️" },
  { label: "Announcements", href: "/dashboard/admin/announcements", icon: "📢" },
];
