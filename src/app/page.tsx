import { MainLayout } from "@/components/layout";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default function HomePage() {
  return (
    <MainLayout title="Dashboard" subtitle="Overview of your multi-agent system">
      <DashboardContent />
    </MainLayout>
  );
}
