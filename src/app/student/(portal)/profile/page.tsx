import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/student-auth";
import ProfileForm from "@/components/student/ProfileForm";
import { PageTitle, dateShort } from "@/components/student/ui";

async function View() {
  const me = await requireStudent();

  const s = await prisma.student.findUnique({
    where: { id: me.id },
    select: {
      name: true,
      mobile: true,
      email: true,
      addressLine: true,
      city: true,
      pincode: true,
      createdAt: true,
      partner: { select: { name: true } },
    },
  });
  if (!s) return null;

  return (
    <div className="space-y-6">
      <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        Member since <b>{dateShort.format(s.createdAt)}</b>
        {s.partner && (
          <>
            {" "}
            · Referred by <b>{s.partner.name}</b>
          </>
        )}
      </p>

      <ProfileForm
        initial={{
          name: s.name,
          mobile: s.mobile,
          email: s.email ?? "",
          addressLine: s.addressLine ?? "",
          city: s.city ?? "",
          pincode: s.pincode ?? "",
        }}
      />
    </div>
  );
}

export default function StudentProfilePage() {
  return (
    <div className="space-y-6">
      <PageTitle title="My Profile" subtitle="Keep your details and delivery address up to date." />
      <Suspense fallback={<p className="text-sm text-slate-400">Loading...</p>}>
        <View />
      </Suspense>
    </div>
  );
}