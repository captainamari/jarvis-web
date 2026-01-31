export default function AgentsPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-6 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold">Agents</h1>
          <p className="text-xs text-muted-foreground">Manage your AI agent skills</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Agent Management</p>
          <p className="text-sm mt-1">Coming in Phase 2</p>
        </div>
      </div>
    </div>
  );
}
