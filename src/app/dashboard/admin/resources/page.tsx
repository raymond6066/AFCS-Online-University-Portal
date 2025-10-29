"use client";

import { FormEvent, useEffect, useState } from "react";
import { DataTable } from "../../../../components/ui/DataTable";
import { LoadingState, ErrorState } from "../../../../components/ui/StateBlocks";
import { useCurrentUserProfile } from "../../../../hooks/useCurrentUserProfile";
import type { ResourceBooking, UserProfile } from "../../../../lib/schema";
import { client } from "../../../../lib/amplifyClient";
import { listResourceBookings, listUserProfiles } from "../../../../services/data";

export default function AdminResourcesPage() {
  const auth = useCurrentUserProfile();
  const [bookings, setBookings] = useState<ResourceBooking[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [bookingData, userData] = await Promise.all([listResourceBookings(), listUserProfiles()]);
        setBookings(bookingData);
        setUsers(userData);
      } catch (err) {
        console.error(err);
        setError("Unable to load resource bookings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateStatus = async (booking: ResourceBooking, status: ResourceBooking["status"]) => {
    try {
      const response = await client.models.ResourceBooking.update({
        id: booking.id,
        status,
        approvedById: auth.profile?.id,
      });
      if (response.data) {
        setBookings((prev) => prev.map((item) => (item.id === booking.id ? response.data! : item)));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update booking.");
    }
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const resourceName = formData.get("resourceName")?.toString() ?? "";
    const requestedById = formData.get("requestedById")?.toString() ?? "";
    const startTime = formData.get("startTime")?.toString() ?? "";
    const endTime = formData.get("endTime")?.toString() ?? "";

    if (!resourceName || !requestedById || !startTime || !endTime) {
      setError("All fields are required to create a booking.");
      return;
    }

    try {
      setFormLoading(true);
      const requester = users.find((user) => user.id === requestedById);
      const response = await client.models.ResourceBooking.create({
        resourceName,
        requestedById,
        startTime,
        endTime,
        status: "PENDING",
        requestedByOwner: requester?.cognitoSub,
      });
      if (response.data) {
        setBookings((prev) => [response.data!, ...prev]);
      }
      event.currentTarget.reset();
    } catch (err) {
      console.error(err);
      setError("Failed to create booking.");
    } finally {
      setFormLoading(false);
    }
  };

  if (auth.loading || loading) {
    return <LoadingState label="Loading resource bookings..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  const userMap = new Map(users.map((user) => [user.id, user.fullName ?? user.email]));

  return (
    <div className="space-y-6">
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create Resource Booking</h2>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div>
            <label htmlFor="resourceName">Resource</label>
            <input id="resourceName" name="resourceName" required />
          </div>
          <div>
            <label htmlFor="requestedById">Requested By</label>
            <select id="requestedById" name="requestedById" required>
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.fullName ?? user.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="startTime">Start Time</label>
            <input id="startTime" name="startTime" type="datetime-local" required />
          </div>
          <div>
            <label htmlFor="endTime">End Time</label>
            <input id="endTime" name="endTime" type="datetime-local" required />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn-primary" disabled={formLoading} type="submit">
              {formLoading ? "Submitting..." : "Create booking"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="section-title">Pending Requests</h3>
        <DataTable
          data={bookings}
          columns={[
            { header: "Resource", accessor: (booking) => booking.resourceName },
            { header: "Requester", accessor: (booking) => userMap.get(booking.requestedById) ?? booking.requestedById },
            { header: "Start", accessor: (booking) => new Date(booking.startTime).toLocaleString() },
            { header: "End", accessor: (booking) => new Date(booking.endTime).toLocaleString() },
            { header: "Status", accessor: (booking) => booking.status },
            {
              header: "Actions",
              accessor: (booking) => (
                <div className="flex gap-2">
                  <button className="text-primary-500" onClick={() => updateStatus(booking, "APPROVED")} type="button">
                    Approve
                  </button>
                  <button className="text-red-500" onClick={() => updateStatus(booking, "REJECTED")} type="button">
                    Reject
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
