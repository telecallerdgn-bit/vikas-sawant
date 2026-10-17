"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button onClick={logout} className="rounded bg-black px-3 py-1 text-white">
      Logout
    </button>
  );
}