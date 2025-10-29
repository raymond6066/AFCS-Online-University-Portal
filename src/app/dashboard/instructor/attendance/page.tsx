"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Attendance, Course, UserProfile } from "../../../../lib/schema";
import { client } from "../../../../lib/amplifyClient";
import { listAttendanceForStudent, listInstructorCourses, listUserProfiles } from "../../../../services/data";

export default function InstructorAttendancePage() {
  const auth = useCurrentUserProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const [courseData, userProfiles] = await Promise.all([
          listInstructorCourses(auth.profile!.id),
          listUserProfiles(),
        ]);
        setCourses(courseData);
        setStudents(userProfiles.filter((profile) => profile.role === "STUDENT"));
      } catch (err) {
        console.error(err);
        setError("Unable to load attendance data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auth.profile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!auth.profile) return;
    const formData = new FormData(event.currentTarget);
    const courseId = formData.get("courseId")?.toString() ?? "";
    const studentId = formData.get("studentId")?.toString() ?? "";
    const date = formData.get("date")?.toString() ?? "";
    const status = formData.get("status")?.toString() ?? "PRESENT";

    if (!courseId || !studentId || !date) {
      setError("Course, student, and date are required.");
      return;
    }

    try {
      setFormLoading(true);
      const student = students.find((profile) => profile.id === studentId);
      const response = await client.models.Attendance.create({
        courseId,
        studentId,
        date,
        status: status as Attendance["status"],
        markedById: auth.profile.id,
        studentOwner: student?.cognitoSub,
      });
      if (response.data) {
        const updatedRecords = await listAttendanceForStudent(studentId);
        setRecords(updatedRecords);
      }
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Failed to mark attendance.");
    } finally {
      setFormLoading(false);
    }
  };

  if (auth.loading || loading) {
    return <LoadingState label="Loading attendance..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Mark Attendance</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="courseId">Course</label>
            <select id="courseId" name="courseId" required>
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="studentId">Student</label>
            <select id="studentId" name="studentId" required>
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName ?? student.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input id="date" name="date" type="date" required />
          </div>
          <div>
            <label htmlFor="status">Status</label>
            <select id="status" name="status">
              <option value="PRESENT">Present</option>
              <option value="ABSENT">Absent</option>
              <option value="LATE">Late</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary" disabled={formLoading} type="submit">
              {formLoading ? "Saving..." : "Save record"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="section-title">Recent Attendance Records</h3>
        <DataTable
          data={records}
          columns={[
            { header: "Date", accessor: (record) => record.date },
            { header: "Status", accessor: (record) => record.status },
            { header: "Course", accessor: (record) => record.courseId },
          ]}
          emptyMessage="Mark attendance to see history."
        />
      </div>
    </div>
  );
}
