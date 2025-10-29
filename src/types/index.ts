export type Role = "STUDENT" | "INSTRUCTOR" | "ADMIN";

export interface DashboardNavLink {
  label: string;
  href: string;
  icon: string;
}

export interface UserProfile {
  id: string;
  cognitoSub: string;
  email: string;
  fullName?: string | null;
  role: Role;
  rank?: string | null;
  serviceNumber?: string | null;
  department?: string | null;
  medicalRecordUrl?: string | null;
  passportPhotoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
