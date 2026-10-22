import { Suspense } from "react";
import ComingSoon from "@/components/ComingSoon";
import { requireStudentAdmin } from "@/lib/sadmin-auth";

async function Guard({ title }: { title: string }) {
  await requireStudentAdmin(); // each page checks login itself, the layout alone is not enough
  return <ComingSoon title={title} />;
}

export default function Placeholder({ title }: { title: string }) {
  return (
    <Suspense fallback={null}>
      <Guard title={title} />
    </Suspense>
  );
}