import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "aws-amplify/auth/server";
import { cookies } from "next/headers";

async function getUser() {
  try {
    const user = await getCurrentUser({ store: cookies() });
    return user;
  } catch (error) {
    return null;
  }
}

export default async function HomePage() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center gap-10 px-4 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          AFCS Online University Portal
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Centralize student information, manage courses, assignments, resources,
          and analytics in one secure platform powered by AWS Amplify.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Link className="btn-primary" href="/login">
          Sign in with Hosted UI
        </Link>
        <Link
          className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-400 hover:text-primary-500 dark:border-slate-700 dark:text-slate-200"
          href="/about"
        >
          Learn more
        </Link>
      </div>
    </main>
  );
}
