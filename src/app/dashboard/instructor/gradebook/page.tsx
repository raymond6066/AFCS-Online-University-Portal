"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { Assignment, Grade, UserProfile } from "../../../../lib/schema";
import { client } from "../../../../lib/amplifyClient";
import { listAssignmentsForCourses, listGradesForStudent, listInstructorCourses, listUserProfiles } from "../../../../services/data";

export default function InstructorGradebookPage() {
  const auth = useCurrentUserProfile();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!auth.profile) return;
    const load = async () => {
      try {
        setLoading(true);
        const courses = await listInstructorCourses(auth.profile!.id);
        const assignmentData = await listAssignmentsForCourses(courses.map((course) => course.id));
        setAssignments(assignmentData);
        const studentProfiles = await listUserProfiles();
        const studentList = studentProfiles.filter((profile) => profile.role === "STUDENT");
        setStudents(studentList);
        const gradeResults = await Promise.all(
          studentList.map((student) => listGradesForStudent(student.id))
        );
        setGrades(gradeResults.flat());
      } catch (err) {
        console.error(err);
        setError("Unable to load gradebook.");
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
    const assignmentId = formData.get("assignmentId")?.toString() ?? "";
    const studentId = formData.get("studentId")?.toString() ?? "";
    const score = Number(formData.get("score") ?? 0);
    const feedback = formData.get("feedback")?.toString() ?? undefined;

    if (!assignmentId || !studentId) {
      setError("Assignment and student are required.");
      return;
    }

    try {
      setFormLoading(true);
      const existing = grades.find((grade) => grade.assignmentId === assignmentId && grade.studentId === studentId);
      const student = students.find((profile) => profile.id === studentId);
      if (existing) {
        const response = await client.models.Grade.update({
          id: existing.id,
          score,
          feedback,
          gradedById: auth.profile.id,
          studentOwner: student?.cognitoSub,
        });
        if (response.data) {
          setGrades((prev) => prev.map((grade) => (grade.id === existing.id ? response.data! : grade)));
        }
      } else {
        const response = await client.models.Grade.create({
          assignmentId,
          studentId,
          score,
          feedback,
          gradedById: auth.profile.id,
          studentOwner: student?.cognitoSub,
        });
        if (response.data) {
          setGrades((prev) => [response.data!, ...prev]);
        }
      }
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Unable to save grade.");
    } finally {
      setFormLoading(false);
    }
  };

  if (auth.loading || loading) {
    return <LoadingState label="Loading gradebook..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const studentMap = new Map(students.map((student) => [student.id, student.fullName ?? student.email]));
  const assignmentMap = new Map(assignments.map((assignment) => [assignment.id, assignment.title]));

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Record Grade</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="assignmentId">Assignment</label>
            <select id="assignmentId" name="assignmentId" required>
              <option value="">Select assignment</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="studentId">Student</label>
            <select id="studentId" name="studentId" required>
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.fullName ?? student.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="score">Score</label>
            <input id="score" name="score" type="number" min="0" max="100" step="0.1" required />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="feedback">Feedback</label>
            <textarea id="feedback" name="feedback" rows={3} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary" disabled={formLoading} type="submit">
              {formLoading ? "Saving..." : "Save grade"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="section-title">Grade Records</h3>
        <DataTable
          data={grades}
          columns={[
            { header: "Assignment", accessor: (grade) => assignmentMap.get(grade.assignmentId) ?? "" },
            { header: "Student", accessor: (grade) => studentMap.get(grade.studentId) ?? "" },
            { header: "Score", accessor: (grade) => grade.score },
            { header: "Feedback", accessor: (grade) => grade.feedback ?? "--" },
          ]}
        />
      </div>
    </div>
  );
}
