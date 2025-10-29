"use client";

import { client } from "../lib/amplifyClient";
import type {
  Announcement,
  Assignment,
  Attendance,
  Course,
  Grade,
  Payment,
  ResourceBooking,
  Schedule,
  UserProfile,
} from "../lib/schema";

export async function listStudentCourses(studentId: string) {
  const enrollment = await client.models.Attendance.list({
    filter: { studentId: { eq: studentId } },
  });
  const courseIds = Array.from(new Set(enrollment.data.map((record) => record.courseId)));
  if (courseIds.length === 0) return [] as Course[];
  const response = await Promise.all(courseIds.map((courseId) => client.models.Course.get({ id: courseId })));
  return response.flatMap((result) => (result.data ? [result.data] : []));
}

export async function listAssignmentsForCourses(courseIds: string[]) {
  if (courseIds.length === 0) return [] as Assignment[];
  const results = await Promise.all(
    courseIds.map((courseId) =>
      client.models.Assignment.list({
        filter: { courseId: { eq: courseId } },
      })
    )
  );
  return results.flatMap((result) => result.data);
}

export async function listGradesForStudent(studentId: string) {
  const result = await client.models.Grade.list({
    filter: { studentId: { eq: studentId } },
  });
  return result.data as Grade[];
}

export async function listScheduleForStudent(studentId: string) {
  const result = await client.models.Schedule.list({
    filter: { studentId: { eq: studentId } },
  });
  return result.data as Schedule[];
}

export async function listAttendanceForStudent(studentId: string) {
  const result = await client.models.Attendance.list({
    filter: { studentId: { eq: studentId } },
  });
  return result.data as Attendance[];
}

export async function listAnnouncementsForAudience(audience: string[]) {
  const result = await client.models.Announcement.list({
    filter: {
      or: audience.map((value) => ({ audience: { eq: value } })),
    },
  });
  return result.data as Announcement[];
}

export async function listInstructorCourses(instructorId: string) {
  const result = await client.models.Course.list({
    filter: { instructorId: { eq: instructorId } },
  });
  return result.data as Course[];
}

export async function listUserProfiles() {
  const result = await client.models.UserProfile.list();
  return result.data as UserProfile[];
}

export async function listResourceBookings() {
  const result = await client.models.ResourceBooking.list();
  return result.data as ResourceBooking[];
}

export async function listPayments() {
  const result = await client.models.Payment.list();
  return result.data as Payment[];
}

export async function listAnnouncements() {
  const result = await client.models.Announcement.list();
  return result.data as Announcement[];
}
