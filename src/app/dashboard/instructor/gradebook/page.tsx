"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useCallback, useEffect, useState } from "react";

type Assignment = {
  id: string;
  title: string;
  courseId: string;
};

type RosterMember = {
  studentId: string;
  studentSub: string;
  fullName?: string | null;
};

type GradeRecord = {
  id: string;
  score?: number | null;
  feedback?: string | null;
};

export default function InstructorGradebookPage() {
  const { user } = useAuthContext();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState("");
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [grades, setGrades] = useState<Record<string, GradeRecord>>({});
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const loadAssignments = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.models.Assignment.list({
        filter: { postedBySub: { eq: user.cognitoSub } },
      });
      const assignmentList = (data ?? []).map((item) => ({
        id: item.id,
        title: item.title,
        courseId: item.courseId,
      }));
      setAssignments(assignmentList);
      if (assignmentList.length > 0) {
        setSelectedAssignment((prev) => prev || assignmentList[0].id);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load assignments.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadAssignments();
  }, [loadAssignments]);

  useEffect(() => {
    const loadRosterAndGrades = async () => {
      if (!selectedAssignment) return;
      const assignment = assignments.find((item) => item.id === selectedAssignment);
      if (!assignment) return;

      setLoading(true);
      setError(null);

      try {
        const { data: enrollmentData } = await client.models.Enrollment.list({
          filter: { courseId: { eq: assignment.courseId } },
        });

        const rosterMembers: RosterMember[] = (enrollmentData ?? []).map((enrollment) => ({
          studentId: enrollment.studentId,
          studentSub: enrollment.studentSub,
          fullName: (enrollment.student as any)?.fullName ?? undefined,
        }));
        setRoster(rosterMembers);

        const { data: gradeData } = await client.models.Grade.list({
          filter: { assignmentId: { eq: selectedAssignment } },
        });

        const gradeMap: Record<string, GradeRecord> = {};
        const scoreMap: Record<string, string> = {};
        const feedbackMap: Record<string, string> = {};
        (gradeData ?? []).forEach((grade) => {
          gradeMap[grade.studentId] = {
            id: grade.id,
            score: grade.score,
            feedback: grade.feedback,
          };
          if (grade.score !== undefined && grade.score !== null) {
            scoreMap[grade.studentId] = String(grade.score);
          }
          if (grade.feedback) {
            feedbackMap[grade.studentId] = grade.feedback;
          }
        });
        setGrades(gradeMap);
        setScores(scoreMap);
        setFeedback(feedbackMap);
      } catch (err) {
        console.error(err);
        setError("Unable to load gradebook data.");
      } finally {
        setLoading(false);
      }
    };

    void loadRosterAndGrades();
  }, [assignments, selectedAssignment]);

  const handleSave = async () => {
    if (!user || !selectedAssignment) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await Promise.all(
        roster.map(async (member) => {
          const scoreValue = scores[member.studentId];
          const parsedScore = scoreValue ? Number(scoreValue) : undefined;
          const gradeFeedback = feedback[member.studentId] || undefined;
          const existing = grades[member.studentId];

          if (existing) {
            const result = await client.models.Grade.update({
              id: existing.id,
              score: parsedScore,
              feedback: gradeFeedback,
            });
            if (result.errors && result.errors.length > 0) {
              throw new Error(result.errors[0].message);
            }
          } else {
            const result = await client.models.Grade.create({
              assignmentId: selectedAssignment,
              studentId: member.studentId,
              studentSub: member.studentSub,
              score: parsedScore,
              feedback: gradeFeedback,
              gradedById: user.id,
              gradedBySub: user.cognitoSub,
            });
            if (result.errors && result.errors.length > 0) {
              throw new Error(result.errors[0].message);
            }
          }
        })
      );
      setSuccess("Grades saved successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to save grades.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleDashboard role="INSTRUCTOR" title="Gradebook">
      {loading && <LoadingState message="Loading gradebook..." />}
      {error && !loading && <ErrorState message={error} />}
      {!loading && !error && (
        <div className="space-y-6">
          {success && <p className="rounded-2xl bg-emerald-500/10 px-4 py-2 text-sm text-emerald-600">{success}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Assignment</label>
            <select
              value={selectedAssignment}
              onChange={(event) => setSelectedAssignment(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/70">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50/80 dark:bg-slate-800/70">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-200">Student</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-200">Score</th>
                  <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-200">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {roster.map((member) => (
                  <tr key={member.studentId} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/60">
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-200">{member.fullName ?? member.studentId}</td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={scores[member.studentId] ?? ""}
                        onChange={(event) =>
                          setScores((prev) => ({ ...prev, [member.studentId]: event.target.value }))
                        }
                        className="w-24 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        value={feedback[member.studentId] ?? ""}
                        onChange={(event) =>
                          setFeedback((prev) => ({ ...prev, [member.studentId]: event.target.value }))
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleSave}
            className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save grades"}
          </button>
        </div>
      )}
    </RoleDashboard>
  );
}
