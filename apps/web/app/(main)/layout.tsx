import { Header } from "@/widgets/header";
import { AuthProvider } from "../providers/auth-provider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <Header />
      <main className="flex-1">{children}</main>
    </AuthProvider>
  );
}
