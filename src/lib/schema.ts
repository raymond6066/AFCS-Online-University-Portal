export type UserRole = "STUDENT" | "INSTRUCTOR" | "ADMIN";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE";
export type AnnouncementAudience = "ALL" | "STUDENT" | "INSTRUCTOR" | "ADMIN";
export type ResourceBookingStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE";

type BaseModel = {
  id: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type UserProfile = BaseModel & {
  cognitoSub: string;
  email: string;
  fullName?: string | null;
  role: UserRole;
  rank?: string | null;
  serviceNumber?: string | null;
  department?: string | null;
  medicalRecordUrl?: string | null;
  passportPhotoUrl?: string | null;
};

export type Course = BaseModel & {
  title: string;
  code: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  instructorId: string;
};

export type Assignment = BaseModel & {
  courseId: string;
  title: string;
  instructions?: string | null;
  dueDate?: string | null;
  postedById: string;
  attachmentUrl?: string | null;
};

export type Grade = BaseModel & {
  studentId: string;
  assignmentId: string;
  score: number;
  feedback?: string | null;
  gradedById?: string | null;
};

export type Attendance = BaseModel & {
  courseId: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  markedById?: string | null;
};

export type Schedule = BaseModel & {
  studentId: string;
  dayOfWeek: string;
  timeRange: string;
  courseId?: string | null;
};

export type Announcement = BaseModel & {
  audience: AnnouncementAudience;
  title: string;
  body: string;
  createdById: string;
};

export type ResourceBooking = BaseModel & {
  resourceName: string;
  requestedById: string;
  startTime: string;
  endTime: string;
  status: ResourceBookingStatus;
  approvedById?: string | null;
};

export type Payment = BaseModel & {
  studentId: string;
  studentOwner?: string | null;
  amount: number;
  status: PaymentStatus;
  description?: string | null;
  timestamp: string;
};

export type Schema = {
  UserProfile: UserProfile;
  Course: Course;
  Assignment: Assignment;
  Grade: Grade;
  Attendance: Attendance;
  Schedule: Schedule;
  Announcement: Announcement;
  ResourceBooking: ResourceBooking;
  Payment: Payment;
};
