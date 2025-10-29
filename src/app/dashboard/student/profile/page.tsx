"use client";

import { LoadingState } from "@/components/feedback/LoadingState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { RoleDashboard } from "@/components/layout/RoleDashboard";
import { useAuthContext } from "@/context/AuthContext";
import { client } from "@/lib/amplifyClient";
import { getSignedUrl, uploadPrivateFile } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function StudentProfilePage() {
  const { user, refresh } = useAuthContext();
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [rank, setRank] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passportLink, setPassportLink] = useState<string | null>(null);
  const [medicalLink, setMedicalLink] = useState<string | null>(null);

  useEffect(() => {
    const initProfile = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        setFullName(user.fullName ?? "");
        setDepartment(user.department ?? "");
        setRank(user.rank ?? "");
        setServiceNumber(user.serviceNumber ?? "");

        if (user.passportPhotoUrl) {
          const url = await getSignedUrl(user.passportPhotoUrl, "protected");
          setPassportLink(url);
        }
        if (user.medicalRecordUrl) {
          const url = await getSignedUrl(user.medicalRecordUrl, "protected");
          setMedicalLink(url);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load secure documents.");
      } finally {
        setLoading(false);
      }
    };

    void initProfile();
  }, [user]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "passport" | "medical") => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const key = await uploadPrivateFile(file, {
        folder: type === "passport" ? "passports" : "medical-records",
        access: "protected",
      });

      const updated = await client.models.UserProfile.update({
        id: user.id,
        [type === "passport" ? "passportPhotoUrl" : "medicalRecordUrl"]: key,
      } as any);

      if (updated.errors && updated.errors.length > 0) {
        throw new Error(updated.errors[0].message);
      }

      const signed = await getSignedUrl(key, "protected");
      if (type === "passport") {
        setPassportLink(signed);
      } else {
        setMedicalLink(signed);
      }
      await refresh();
      setSuccess("Document uploaded successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to upload file.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await client.models.UserProfile.update({
        id: user.id,
        fullName,
        department,
        rank,
        serviceNumber,
      });

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      await refresh();
      setSuccess("Profile updated successfully.");
    } catch (err) {
      console.error(err);
      setError("Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleDashboard role="STUDENT" title="Profile">
      {loading && <LoadingState message="Preparing your profile..." />}
      {!loading && (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {error && <ErrorState message={error} />}
          {success && (
            <p className="rounded-3xl bg-emerald-500/10 p-4 text-sm font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
              {success}
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Full name</label>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Department / Program</label>
              <input
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Rank</label>
              <input
                value={rank}
                onChange={(event) => setRank(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Service number</label>
              <input
                value={serviceNumber}
                onChange={(event) => setServiceNumber(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Passport photo</label>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => void handleFileUpload(event, "passport")}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-sm text-slate-500 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              {passportLink && (
                <a
                  href={passportLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  View passport
                </a>
              )}
            </div>
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Medical record</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => void handleFileUpload(event, "medical")}
                className="w-full rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-10 text-sm text-slate-500 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              />
              {medicalLink && (
                <a
                  href={medicalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  Download medical record
                </a>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="rounded-2xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/40"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      )}
    </RoleDashboard>
  );
}
