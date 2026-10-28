import { Suspense } from "react";
import { SITE } from "@/lib/site-config";
import RedirectIfSignedIn from "@/components/site/RedirectIfSignedIn";
import StudentRegisterForm from "@/components/site/StudentRegisterForm";

export const metadata = { title: `Create your account | ${SITE.brand}` };

// Ye server page hai. Form (client) alag file me hai, kyunki redirect cookie padhne wale server code se hota hai.
export default function StudentRegisterPage() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <StudentRegisterForm />
    </>
  );
}