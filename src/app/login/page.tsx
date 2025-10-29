"use client";

import { useEffect } from "react";
import { signInWithRedirect } from "aws-amplify/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    signInWithRedirect({ provider: "COGNITO" }).catch((error) => {
      console.error("Failed to redirect to Cognito Hosted UI", error);
      router.replace("/");
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="card text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Redirecting you to the secure Cognito Hosted UI...
        </p>
      </div>
    </main>
  );
}
