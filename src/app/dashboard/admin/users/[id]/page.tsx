"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { client } from "@/lib/amplifyClient";
import { getSignedUrl } from "@/lib/storage";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type UserProfile = {
  id: string;
  fullName?: string | null;
  email: string;
  role: string;
  department?: string | null;
  rank?: string | null;
  serviceNumber?: string | null;
  passportPhotoUrl?: string | null;
  medicalRecordUrl?: string | null;
  createdAt?: string;
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params?.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [passportUrl, setPassportUrl] = useState<string | null>(null);
  const [medicalUrl, setMedicalUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await client.models.UserProfile.get({ id: userId });
        if (data) {
          setProfile(data as UserProfile);
          if (data.passportPhotoUrl) {
            const url = await getSignedUrl(data.passportPhotoUrl, "protected");
            setPassportUrl(url);
          }
          if (data.medicalRecordUrl) {
            const url = await getSignedUrl(data.medicalRecordUrl, "protected");
            setMedicalUrl(url);
          }
        } else {
          setError("User profile not found.");
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      void loadProfile();
    }
  }, [userId]);

  return (
    <RoleDashboard role="ADMIN" title="User detail">
      {loading && <LoadingState message="Loading profile..." />}
      {error && !loading && <ErrorState message={error} />}
      {!loading && !error && profile && (
        <div className="space-y-6">
          <Link href="/dashboard/admin/users" className="text-sm font-semibold text-primary hover:underline">
            ← Back to users
          </Link>
          <div className="rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 dark:bg-slate-900/70">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{profile.fullName ?? profile.email}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-slate-500">Email</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Role</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{profile.role}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Department</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{profile.department ?? "--"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Rank</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{profile.rank ?? "--"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Service number</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{profile.serviceNumber ?? "--"}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-slate-500">Created</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : "--"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 dark:bg-slate-900/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Passport photo</h3>
              {passportUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={passportUrl} alt="Passport" className="h-64 w-full rounded-2xl object-cover" />
              ) : (
                <p className="text-sm text-slate-500">No passport on file.</p>
              )}
            </div>
            <div className="space-y-3 rounded-3xl bg-white/80 p-6 shadow-xl shadow-slate-900/5 dark:bg-slate-900/70">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Medical record</h3>
              {medicalUrl ? (
                <a
                  href={medicalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/20"
                >
                  Download PDF
                </a>
              ) : (
                <p className="text-sm text-slate-500">No medical record on file.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </RoleDashboard>
  );
}
