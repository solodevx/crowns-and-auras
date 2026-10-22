import { Suspense } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getOrderCounts } from "@/lib/admin-orders";

export const metadata = { title: "Dashboard" };

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <Suspense fallback={<p className="mt-6 text-ink/70">Loading…</p>}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

async function DashboardContent() {
  await requireAdmin();
  const counts = await getOrderCounts();

  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      <Link
        href="/admin/orders?view=open"
        className="rounded-lg border border-ink/10 p-6 hover:bg-ink/5"
      >
        <p className="text-sm text-ink/70">Open orders</p>
        <p className="mt-1 font-serif text-4xl">{counts.open}</p>
      </Link>
      <Link
        href="/admin/orders?view=open"
        className="rounded-lg border border-ink/10 p-6 hover:bg-ink/5"
      >
        <p className="text-sm text-ink/70">Waiting for payment</p>
        <p className="mt-1 font-serif text-4xl">{counts.awaitingPayment}</p>
      </Link>
    </div>
  );
}