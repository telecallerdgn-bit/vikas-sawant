import Link from "next/link";
import type { ReactNode } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { getKindSession } from "@/lib/kind-session";
import { logoutStudent } from "@/lib/student-actions";

/** Shown while the session is being read. It is neutral, so a logged-in student never sees "Login" flash. */
export function AuthSkeleton() {
  return <div aria-hidden className="h-full min-h-11 w-40 animate-pulse bg-white/10" />;
}

export default async function HeaderAuth({ guest }: { guest: ReactNode }) {
  const student = await getKindSession("student");
  if (!student) return <>{guest}</>;

  const name = student.name.trim() || "Student";
  const first = name.split(/\s+/)[0];
  const initial = first.charAt(0).toUpperCase();

  return (
    <div className="flex h-full items-center gap-1 bg-brand-900 px-3 text-white">
      <Link
        href="/student/dashboard"
        title="Go to my dashboard"
        className="flex items-center gap-2 rounded-lg py-1.5 pr-2 hover:text-gold-300"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-400 text-sm font-bold text-brand-900">
          {initial}
        </span>
        <span className="hidden max-w-[9rem] truncate text-sm font-bold sm:block">Hi, {first}</span>
      </Link>

      <Link
        href="/student/dashboard"
        className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold text-gold-300 hover:bg-white/10 md:flex"
      >
        <LayoutDashboard className="h-4 w-4" />
        Dashboard
      </Link>

      <form action={logoutStudent}>
        <button
          type="submit"
          aria-label="Log out"
          title="Log out"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}