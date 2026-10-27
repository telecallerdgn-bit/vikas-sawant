import { SITE } from "@/lib/site-config";
import SiteHeaderClient from "@/components/site/SiteHeaderClient";

export default function SiteHeader() {
  const phone = process.env.SUPPORT_PHONE?.trim() ?? "";
  const email = process.env.SUPPORT_EMAIL?.trim() ?? "";

  return (
    <SiteHeaderClient
      brand={SITE.brand}
      phone={phone}
      email={email}
      hours={SITE.hours}
      social={SITE.social}
    />
  );
}