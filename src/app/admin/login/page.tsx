import LoginForm from "@/components/admin/LoginForm";

export const metadata = { title: "Admin login" };

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="font-serif text-3xl">Admin login</h1>
      <LoginForm />
    </main>
  );
}
