import Link from "next/link";

export default function PublicHome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 p-6 text-center font-[family-name:var(--font-lato)]">
      <div>
        <h1 className="text-5xl font-bold text-slate-900">vikas-sawant</h1>
        <p className="mt-2 text-slate-600">Learn, grow, succeed. Our full website is coming soon.</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/student/login" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700">
          Student login
        </Link>
        <Link href="/student/register" className="rounded-xl border border-blue-200 bg-white px-5 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50">
          Create account
        </Link>
      </div>

      <p className="text-xs text-slate-500">
        <Link href="/partner-apply" className="underline">Become a partner</Link>
        {" · "}
        <Link href="/portal" className="underline">Staff login</Link>
      </p>
    </main>
  );
}