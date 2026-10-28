import { Suspense } from "react";
import { SITE } from "@/lib/site-config";
import RedirectIfSignedIn from "@/components/site/RedirectIfSignedIn";
import StudentLoginForm from "@/components/site/StudentLoginForm";

export const metadata = { title: `Student login | ${SITE.brand}` };

// Ye server page hai. Form (client) alag file me hai, kyunki redirect cookie padhne wale server code se hota hai.
export default function StudentLoginPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <StudentLoginForm />
    </>
  );
}