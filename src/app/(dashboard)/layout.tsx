import { ClientProvider } from "@/contexts/client-context";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProvider>
      <DashboardShell>{children}</DashboardShell>
    </ClientProvider>
  );
}
