"use client";

export default function KindLogoutButton({
  endpoint,
  redirectTo,
  className = "rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50",
}: {
  endpoint: string;
  redirectTo: string;
  className?: string;
}) {
  async function logout() {
    await fetch(endpoint, { method: "POST" });
    window.location.href = redirectTo;
  }
  return (
    <button onClick={logout} className={className}>
      Logout
    </button>
  );
}