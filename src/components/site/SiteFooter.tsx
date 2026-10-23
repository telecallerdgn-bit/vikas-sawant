import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { SITE } from "@/lib/site-config";

const link = "text-sm text-slate-300 hover:text-gold-300";

export default function SiteFooter() {
  const email = process.env.SUPPORT_EMAIL?.trim();
  const phone = process.env.SUPPORT_PHONE?.trim();

  return (
    <footer className="border-t-4 border-gold-400 bg-brand-900 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Image src="/logo.webp" alt={SITE.brand} width={360} height={370} className="h-16 w-auto" />
           
          </div>
          <p className="mt-4 max-w-sm text-sm text-slate-300">{SITE.tagline}. Courses in live, recorded and book formats.</p>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gold-400">Explore</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/courses" className={link}>Courses</Link></li>
            <li><Link href="/blog" className={link}>Blog</Link></li>
            <li><Link href="/contact" className={link}>Contact</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-gold-400">Account</p>
          <ul className="mt-4 space-y-2.5">
            <li><Link href="/student/login" className={link}>Student login</Link></li>
            <li><Link href="/student/register" className={link}>Create account</Link></li>
            <li><Link href="/partner-apply" className={link}>Become a partner</Link></li>
            <li><Link href="/portal" className={link}>Partner and staff login</Link></li>
          </ul>
          {(email || phone) && (
            <div className="mt-5 space-y-2 text-sm text-slate-300">
              {email && (
                <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold-400" />{email}</p>
              )}
              {phone && (
                <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold-400" />{phone}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-400">
        &copy; {SITE.brand}. All rights reserved.
      </div>
    </footer>
  );
}