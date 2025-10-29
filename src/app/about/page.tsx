export default function AboutPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-8 px-4 py-20">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">About AFCS Online University</h1>
      <p className="text-lg text-slate-600 dark:text-slate-300">
        The AFCS Online University portal centralizes student officer records, course
        resources, attendance, and billing into a single Amplify-powered platform. React,
        Tailwind CSS, and AWS Amplify Gen 2 provide a scalable foundation for the academy’s
        digital transformation.
      </p>
      <p className="text-lg text-slate-600 dark:text-slate-300">
        This application ships with role-based dashboards for students, instructors, and
        administrators, secure Cognito authentication, S3-backed document storage, and
        Amplify Data models that enforce least-privilege access.
      </p>
    </main>
  );
}
