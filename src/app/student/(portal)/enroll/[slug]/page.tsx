import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/student-auth";
import { getCourseBySlug } from "@/lib/site-data";
import { MODE_LABEL } from "@/lib/catalog";
import { modeOptions } from "@/lib/pricing";
import EnrollForm from "@/components/student/EnrollForm";
import { PageTitle, Panel, rupees } from "@/components/student/ui";

async function View({ params }: { params: Promise<{ slug: string }> }) {
  const me = await requireStudent(); // dynamic access first, so Date.now() below is safe
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) notFound();

  const [existing, student] = await Promise.all([
    prisma.order.findFirst({
      where: { studentId: me.id, courseId: course.id, status: { in: ["PENDING", "PAID"] } },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, amount: true, mode: true },
    }),
    prisma.student.findUnique({ where: { id: me.id }, select: { addressLine: true, city: true, pincode: true } }),
  ]);

  const phone = process.env.SUPPORT_PHONE?.trim();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/courses/${slug}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#a66e00] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Course page
        </Link>
        <PageTitle title={`Enroll in ${course.name}`} subtitle="Choose how you want to learn." />
      </div>

      {existing?.status === "PAID" ? (
        <Panel title="You already own this course">
          <div className="flex items-start gap-3 border-t border-slate-100 p-5">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-700">This course is already in your account.</p>
              <Link href="/student/courses" className="mt-2 inline-block text-sm font-semibold text-[#a66e00] hover:underline">
                Go to My Courses
              </Link>
            </div>
          </div>
        </Panel>
      ) : existing ? (
        <Panel title="Payment pending">
          <div className="flex items-start gap-3 border-t border-slate-100 p-5">
            <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div className="space-y-1 text-sm text-slate-700">
              <p>
                Your request for <b>{course.name}</b> ({MODE_LABEL[existing.mode ?? course.mode]}) is received. Order #
                {existing.id}, amount <b>{rupees.format(Number(existing.amount))}</b>.
              </p>
              <p>
                Please complete the payment as told by our team. The course opens in your account as soon as we
                confirm it.
                {phone && (
                  <>
                    {" "}
                    Call us on <b>{phone}</b>.
                  </>
                )}
              </p>
              <Link href="/student/orders" className="inline-block pt-1 font-semibold text-[#a66e00] hover:underline">
                View my orders
              </Link>
            </div>
          </div>
        </Panel>
      ) : (
        <Panel title="Your enrolment">
          <div className="border-t border-slate-100 p-5">
            <EnrollForm
              courseId={course.id}
              options={modeOptions(course, Date.now())}
              address={{
                addressLine: student?.addressLine ?? "",
                city: student?.city ?? "",
                pincode: student?.pincode ?? "",
              }}
            />
          </div>
        </Panel>
      )}
    </div>
  );
}

export default function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
      <View params={params} />
    </Suspense>
  );
}