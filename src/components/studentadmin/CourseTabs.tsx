import Link from "next/link";

export default function CourseTabs({
  courseId,
  active,
}: {
  courseId: number;
  active: "details" | "curriculum";
}) {
  const tabs = [
    { key: "details", label: "Details", href: `/student-admin/courses/${courseId}` },
    { key: "curriculum", label: "Curriculum", href: `/student-admin/courses/${courseId}/curriculum` },
  ] as const;

  return (
    <nav aria-label="Course sections" className="flex gap-1 border-b border-slate-200">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={t.href}
          aria-current={active === t.key ? "page" : undefined}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            active === t.key
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}