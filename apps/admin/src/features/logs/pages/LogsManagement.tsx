import { useState } from "react";
import { useLogs, useLogStats, useClearLogs } from "@/features/logs";

import LogsHeader from "../components/LogsHeader";
import LogStatsCards from "../components/LogStatsCards";
import LogFilters from "../components/LogFilters";
import LogTable from "../components/LogTable";
import { useConfirm, showFeedback } from "@/components/modal";

export default function LogsManagement() {
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const { confirm } = useConfirm();

  // Pagination State (Limit 20 logs per page to boost UI performance)
  const [currentPage, setCurrentPage] = useState(1);
  const LOGS_PER_PAGE = 20;

  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const { data: rawLogs = [], isLoading: isLogsLoading, refetch } = useLogs({
    level: selectedLevel,
    search: searchTerm,
  });

  const { data: stats, isLoading: isStatsLoading } = useLogStats();
  const clearLogsMutation = useClearLogs();

  const logs = Array.isArray(rawLogs) ? rawLogs : [];
  const totalLogs = logs.length;
  const totalPages = Math.max(1, Math.ceil(totalLogs / LOGS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;

  const paginatedLogs = logs.slice(
    (currentPage - 1) * LOGS_PER_PAGE,
    currentPage * LOGS_PER_PAGE
  );

  const handleNext = () => {
    if (hasNextPage) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const handlePageSelect = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleOpenClearDialog = async () => {
    const confirmed = await confirm({
      title: "Clear Audit Log History?",
      description: "This action will purge all current system audit logs (INFO, WARN, ERROR, FATAL). This action cannot be undone.",
      variant: "destructive",
      confirmText: "Confirm Purge",
    });

    if (!confirmed) return;

    clearLogsMutation.mutate(undefined, {
      onSuccess: () => {
        showFeedback.success("Cleared system audit logs.");
      },
      onError: (err: any) => {
        showFeedback.error(err.response?.data?.message || "Failed to clear logs.");
      },
    });
  };

  // Export visible logs to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      showFeedback.error("No log entries available to export.");
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
    showFeedback.success(`Exported ${logs.length} log records to CSV.`);
  };

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full  font-sans bg-background text-foreground">
      {/* Header Toolbar */}
      <LogsHeader
        isLoading={isLogsLoading}
        onRefresh={refetch}
        onExportCSV={handleExportCSV}
        onOpenClearDialog={handleOpenClearDialog}
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
        onSelectLevel={handleLevelChange}
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
      />

      {/* Live Stream Table */}
      <LogTable
        logs={paginatedLogs}
        totalLogs={totalLogs}
        currentPage={currentPage}
        totalPages={totalPages}
        hasNextPage={hasNextPage}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onPageSelect={handlePageSelect}
        isLoading={isLogsLoading}
        selectedLevel={selectedLevel}
        searchTerm={searchTerm}
      />
    </div>
  );
}
