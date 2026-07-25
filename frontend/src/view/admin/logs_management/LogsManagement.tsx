import { useState } from "react";
import { toast } from "sonner";
import { useLogs, useLogStats, useClearLogs } from "./hooks/useLogs";

import LogsHeader from "./components/LogsHeader";
import LogStatsCards from "./components/LogStatsCards";
import LogFilters from "./components/LogFilters";
import LogTable from "./components/LogTable";
import ClearLogsDialog from "./components/ClearLogsDialog";

export default function LogsManagement() {
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  const { data: rawLogs = [], isLoading: isLogsLoading, refetch } = useLogs({
    level: selectedLevel,
    search: searchTerm,
  });

  const { data: stats, isLoading: isStatsLoading } = useLogStats();
  const clearLogsMutation = useClearLogs();

  const logs = Array.isArray(rawLogs) ? rawLogs : [];

  const handleConfirmClear = () => {
    clearLogsMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Cleared system audit logs.");
        setIsConfirmClearOpen(false);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to clear logs.");
        setIsConfirmClearOpen(false);
      },
    });
  };

  // Export visible logs to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      toast.error("No log entries available to export.");
      return;
    }

    const headers = ["ID", "Level", "Timestamp", "Action", "Source", "User Email", "IP Address", "Message", "Metadata"];
    const rows = logs.map((l) => [
      l.id,
      l.level,
      new Date(l.createdAt).toISOString(),
      `"${l.action || ""}"`,
      `"${l.source || ""}"`,
      `"${l.userEmail || ""}"`,
      `"${l.ipAddress || ""}"`,
      `"${(l.message || "").replace(/"/g, '""')}"`,
      `"${(l.metadata || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `system_logs_${selectedLevel.toLowerCase()}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${logs.length} log records to CSV.`);
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
      {/* Header Toolbar */}
      <LogsHeader
        isLoading={isLogsLoading}
        onRefresh={refetch}
        onExportCSV={handleExportCSV}
        onOpenClearDialog={() => setIsConfirmClearOpen(true)}
      />

      {/* KPI Stats Cards */}
      <LogStatsCards
        stats={stats}
        isStatsLoading={isStatsLoading}
        totalLogsFallback={logs.length}
      />

      {/* Level Filters & Search Keyword Bar */}
      <LogFilters
        selectedLevel={selectedLevel}
        onSelectLevel={setSelectedLevel}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Live Stream Table */}
      <LogTable
        logs={logs}
        isLoading={isLogsLoading}
        selectedLevel={selectedLevel}
        searchTerm={searchTerm}
      />

      {/* Confirmation Dialog */}
      <ClearLogsDialog
        isOpen={isConfirmClearOpen}
        onOpenChange={setIsConfirmClearOpen}
        onConfirmClear={handleConfirmClear}
      />
    </div>
  );
}
