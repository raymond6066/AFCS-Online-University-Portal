"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { SimpleTable } from "@/components/tables/SimpleTable";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { client } from "@/lib/amplifyClient";
import { useEffect, useState } from "react";

type Booking = {
  id: string;
  resourceName: string;
  status: string;
  startTime: string;
  endTime: string;
  requestedBy?: { fullName?: string | null; email: string };
};

const statuses = ["PENDING", "APPROVED", "REJECTED"] as const;

type Status = (typeof statuses)[number];

export default function AdminResourcesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await client.models.ResourceBooking.list({});
      setBookings((data ?? []) as Booking[]);
    } catch (err) {
      console.error(err);
      setError("Unable to load resource bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBookings();
  }, []);

  const handleUpdate = async (booking: Booking, status: Status) => {
    setSavingId(booking.id);
    setError(null);
    try {
      const result = await client.models.ResourceBooking.update({
        id: booking.id,
        status,
      });
      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }
      await loadBookings();
    } catch (err) {
      console.error(err);
      setError("Unable to update resource booking.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <RoleDashboard role="ADMIN" title="Resource booking">
      {loading && <LoadingState message="Loading bookings..." />}
      {error && !loading && <ErrorState message={error} onRetry={loadBookings} />}
      {!loading && !error && (
        <SimpleTable
          columns={[
            { header: "Resource", accessor: (item: Booking) => item.resourceName },
            {
              header: "Requested by",
              accessor: (item: Booking) => item.requestedBy?.fullName ?? item.requestedBy?.email ?? "--",
            },
            {
              header: "Time",
              accessor: (item: Booking) =>
                `${new Date(item.startTime).toLocaleString()} - ${new Date(item.endTime).toLocaleString()}`,
            },
            {
              header: "Status",
              accessor: (item: Booking) => (
                <select
                  value={item.status}
                  onChange={(event) => void handleUpdate(item, event.target.value as Status)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  disabled={savingId === item.id}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              ),
            },
          ]}
          data={bookings}
          emptyMessage="No resource bookings submitted."
        />
      )}
    </RoleDashboard>
  );
}
