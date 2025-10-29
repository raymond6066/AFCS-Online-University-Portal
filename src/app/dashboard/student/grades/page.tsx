"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useMemo, useState } from "react";

type GradeRecord = {
  id: string;
  assignmentTitle?: string | null;
  score?: number | null;
  feedback?: string | null;
  gradedBy?: string | null;
};

export default function StudentGradesPage() {
  const { user } = useAuthContext();
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGrades = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const { data } = await client.models.Grade.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const gradeRecords: GradeRecord[] = (data ?? []).map((grade) => ({
          id: grade.id,
          assignmentTitle: (grade.assignment as any)?.title ?? grade.assignmentId,
          score: grade.score,
          feedback: grade.feedback,
          gradedBy: (grade.gradedBy as any)?.fullName ?? undefined,
        }));

        setGrades(gradeRecords);
      } catch (err) {
        console.error(err);
        setError("Unable to load grades.");
      } finally {
        setLoading(false);
      }
    };

    void loadGrades();
  }, [user]);

  const average = useMemo(() => {
    if (grades.length === 0) return null;
    const total = grades.reduce((sum, grade) => sum + (grade.score ?? 0), 0);
    return total / grades.length;
  }, [grades]);

  return (
    <RoleDashboard role="STUDENT" title="Grades">
      {loading && <LoadingState message="Loading gradebook..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <div className="space-y-6">
          {average !== null && (
            <div className="rounded-3xl bg-emerald-500/10 p-6 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              Current average: {average.toFixed(2)}
            </div>
          )}
          <SimpleTable
            columns={[
              { header: "Assignment", accessor: (item: GradeRecord) => item.assignmentTitle ?? "--" },
              { header: "Score", accessor: (item: GradeRecord) => item.score ?? "--" },
              { header: "Instructor", accessor: (item: GradeRecord) => item.gradedBy ?? "--" },
              { header: "Feedback", accessor: (item: GradeRecord) => item.feedback ?? "--" },
            ]}
            data={grades}
            emptyMessage="No grades published yet."
          />
        </div>
      )}
    </RoleDashboard>
  );
}
