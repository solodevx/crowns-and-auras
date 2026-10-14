import { Suspense } from "react";
import { requireAdmin } from "@/lib/admin-auth";

export const metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<p className="text-ink/60">Checking your sign-in…</p>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await requireAdmin(); // the lock: no wristband, no dashboard

  return (
    <>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-4 text-ink/70">
        You are signed in. Orders and products are coming next.
      </p>
    </>
  );
}
