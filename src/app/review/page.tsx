import { MainLayout } from "@/components/layout";

export default function ReviewPage() {
  return (
    <MainLayout title="Review Queue" subtitle="Human-in-the-loop requests">
      <div className="p-6">
        <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
          <p>HITL Review Queue - Coming in Phase 3</p>
        </div>
      </div>
    </MainLayout>
  );
}
