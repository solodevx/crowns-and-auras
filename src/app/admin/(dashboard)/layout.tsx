import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <nav aria-label="Admin" className="flex items-center gap-6 text-sm">
            <Link href="/admin" className="font-serif text-lg">
              Admin
            </Link>
            <Link href="/admin/orders" className="hover:underline">
              Orders
            </Link>
            <Link href="/admin/products" className="hover:underline">
              Products
            </Link>
          </nav>
          <form action={logoutAction}>
            <button type="submit" className="h-11 px-2 text-sm underline">
              Log out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}