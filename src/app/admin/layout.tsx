// Tells search engines to ignore everything under /admin
export const metadata = { robots: { index: false, follow: false } };

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
