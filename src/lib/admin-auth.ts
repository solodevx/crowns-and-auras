import "server-only";
import { redirect } from "next/navigation";
import { getSession, type AdminSession } from "@/lib/session";

// The guard every admin page and admin server action calls first.
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  return session;
}
