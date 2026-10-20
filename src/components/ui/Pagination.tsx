import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  total,
  pageSize,
  noun,
}: {
  basePath: string;
  page: number;
  total: number;
  pageSize: number;
  noun: string;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const href = (p: number) => (p > 1 ? `${basePath}?page=${p}` : basePath);
  const on = "rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50";
  const off = "rounded-lg border border-slate-100 px-3 py-1.5 font-medium text-slate-300";

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-3.5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {from}–{to} of {total} {noun}
      </span>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs">
            Page {page} of {totalPages}
          </span>
          {page > 1 ? <Link href={href(page - 1)} className={on}>Previous</Link> : <span className={off}>Previous</span>}
          {page < totalPages ? <Link href={href(page + 1)} className={on}>Next</Link> : <span className={off}>Next</span>}
        </div>
      )}
    </div>
  );
}