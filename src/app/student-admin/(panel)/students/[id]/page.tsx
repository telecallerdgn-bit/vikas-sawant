import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudentAdmin } from "@/lib/sadmin-auth";
import { MODE_LABEL } from "@/lib/catalog";
import StudentEditForm from "@/components/studentadmin/StudentEditForm";
import { Avatar, Card, Empty, ORDER_PILL, Pill, SAHeader, TH, THEAD, fmtDate, inr } from "@/components/studentadmin/ui";

async function View({ params }: { params: Promise<{ id: string }> }) {
  await requireStudentAdmin();

  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const s = await prisma.student.findUnique({
    where: { id },
    include: {
      partner: { select: { name: true, referralCode: true } },
      orders: {
        orderBy: { createdAt: "desc" },
        include: { course: { select: { name: true, mode: true } } },
      },
    },
  });
  if (!s) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
        <Avatar name={s.name} />
        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900">{s.name}</p>
          <p className="text-sm text-slate-500">
            {s.mobile} · joined {fmtDate.format(s.createdAt)}
            {s.partner ? ` · partner ${s.partner.name}` : " · direct student"}
          </p>
        </div>
        <Pill cls={s.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}>
          {s.isActive ? "Active" : "Disabled"}
        </Pill>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <StudentEditForm
          initial={{
            id: s.id,
            name: s.name,
            mobile: s.mobile,
            email: s.email ?? "",
            addressLine: s.addressLine ?? "",
            city: s.city ?? "",
            pincode: s.pincode ?? "",
            partnerCode: s.partner?.referralCode ?? "",
            isActive: s.isActive,
          }}
        />

        <div className="h-fit">
          <Card title="Orders" badge={`${s.orders.length} total`}>
            {s.orders.length === 0 ? (
              <Empty title="No orders yet." text="Purchases by this student appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className={THEAD}>
                    <tr>
                      <th className="px-5 py-3 font-semibold">Order</th>
                      <th className={TH}>Course</th>
                      <th className={`${TH} text-right`}>Amount</th>
                      <th className={TH}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.orders.map((o) => (
                      <tr key={o.id} className="border-t border-slate-100 align-top">
                        <td className="px-5 py-3.5">
                          <p className="font-mono">#{o.id}</p>
                          <p className="text-xs text-slate-400">{fmtDate.format(o.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-slate-800">{o.course.name}</p>
                          <p className="text-xs text-slate-500">{MODE_LABEL[o.mode ?? o.course.mode]}</p>
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono lining-nums">{inr.format(Number(o.amount))}</td>
                        <td className="px-4 py-3.5">
                          <Pill cls={ORDER_PILL[o.status].cls}>{ORDER_PILL[o.status].label}</Pill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/student-admin/students" className="mb-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          All students
        </Link>
        <SAHeader title="Student" subtitle="View details, edit them, or manage the account." />
      </div>
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View params={params} />
      </Suspense>
    </div>
  );
}