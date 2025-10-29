import type { UserRole } from "./schema";

export const DASHBOARD_ROUTE: Record<UserRole, string> = {
  STUDENT: "/dashboard/student",
  INSTRUCTOR: "/dashboard/instructor",
  ADMIN: "/dashboard/admin",
};

export const ROLE_LABEL: Record<UserRole, string> = {
  STUDENT: "Student Officer",
  INSTRUCTOR: "Instructor",
  ADMIN: "Administrator",
};

export const isRole = (value: string | undefined | null): value is UserRole => {
  return value === "STUDENT" || value === "INSTRUCTOR" || value === "ADMIN";
};
