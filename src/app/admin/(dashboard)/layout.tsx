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
          <p className="font-serif text-lg">Admin</p>
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
