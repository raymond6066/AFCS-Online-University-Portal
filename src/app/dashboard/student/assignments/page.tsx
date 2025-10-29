"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type Assignment = {
  id: string;
  title: string;
  dueDate?: string | null;
  courseId: string;
  instructions?: string | null;
};

export default function StudentAssignmentsPage() {
  const { user } = useAuthContext();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAssignments = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const { data: enrollmentData } = await client.models.Enrollment.list({
          filter: { studentSub: { eq: user.cognitoSub } },
        });

        const courseIds = (enrollmentData ?? []).map((enrollment) => enrollment.courseId);

        const assignmentResults = await Promise.all(
          courseIds.map((courseId) =>
            client.models.Assignment.list({
              filter: { courseId: { eq: courseId } },
            })
          )
        );

        const records: Assignment[] = assignmentResults
          .flatMap(({ data }) => data ?? [])
          .map((item) => ({
            id: item.id,
            title: item.title,
            courseId: item.courseId,
            dueDate: item.dueDate,
            instructions: item.instructions,
          }));

        setAssignments(records);
      } catch (err) {
        console.error(err);
        setError("Unable to load assignments.");
      } finally {
        setLoading(false);
      }
    };

    void loadAssignments();
  }, [user]);

  return (
    <RoleDashboard role="STUDENT" title="Assignments">
      {loading && <LoadingState message="Gathering assignments..." />}
      {error && !loading && <ErrorState message={error} onRetry={() => window.location.reload()} />}
      {!loading && !error && (
        <SimpleTable
          columns={[
            { header: "Title", accessor: (item: Assignment) => item.title },
            { header: "Course", accessor: (item: Assignment) => item.courseId },
            {
              header: "Due",
              accessor: (item: Assignment) =>
                item.dueDate ? new Date(item.dueDate).toLocaleString() : "TBD",
            },
            {
              header: "Instructions",
              accessor: (item: Assignment) => item.instructions ?? "--",
            },
          ]}
          data={assignments}
          emptyMessage="No assignments assigned yet."
        />
      )}
    </RoleDashboard>
  );
}
