import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Search, Mail } from "lucide-react";
import { showFeedback } from "@/components/modal";
import { DataTablePagination } from "@/components/custom/pagination";
import EmailStudentModal from "./EmailStudentModal";

const ITEMS_PER_PAGE = 10;

export function GuidanceAssignmentsDesk() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedAssignmentForEmail, setSelectedAssignmentForEmail] = useState<any>(null);

  // Reset pagination on filter or search term change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, search]);

  const {
    data: assignments = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["guidanceAssignments", filterStatus, search],
    queryFn: async () => {
      const res = await axiosPrivate.get("/guidance", {
        params: {
          status: filterStatus !== "ALL" ? filterStatus : undefined,
          search: search.trim() || undefined,
        },
      });
      return res.data?.data?.assignments || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, resolutionNotes }: { id: string; status: string; resolutionNotes?: string }) => {
      const res = await axiosPrivate.put(`/guidance/${id}`, {
        status,
        resolutionNotes,
      });
      return res.data;
    },
    onSuccess: () => {
      showFeedback.success("Guidance case status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["guidanceAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["failingStudents"] });
    },
    onError: (err: any) => {
      showFeedback.error(err?.response?.data?.message || "Failed to update guidance status.");
    },
  });

  const totalItems = assignments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const paginatedAssignments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return assignments.slice(start, start + ITEMS_PER_PAGE);
  }, [assignments, currentPage]);

  const handleNext = () => {
    if (hasNextPage) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (hasPreviousPage) setCurrentPage((prev) => prev - 1);
  };

  const handlePageSelect = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4 font-sans text-foreground">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            placeholder="Search student, advisor, or referral reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30 border-border rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["ALL", "PENDING", "IN_PROGRESS", "RESOLVED"].map((st) => (
            <Button
              key={st}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFilterStatus(st)}
              className={`h-7 px-3 text-xs rounded-xl cursor-pointer ${
                filterStatus === st
                  ? "bg-primary text-primary-foreground border-primary font-bold"
                  : "bg-card text-muted-foreground hover:bg-muted/40"
              }`}
            >
              {st}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="text-xs font-bold text-muted-foreground">Student Profile</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-bold text-muted-foreground">Assigned Advisor</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-bold text-muted-foreground">Subject Focus & Reason</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-bold text-muted-foreground">Status</TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-bold text-muted-foreground">Assigned Date</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  Loading guidance assignments desk...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-destructive">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p>Failed to load guidance assignments: {(error as any)?.message || "Server error"}</p>
                    <Button variant="outline" size="sm" onClick={() => refetch()} className="h-7 text-xs">
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : totalItems === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  No guidance assignments found matching filter.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssignments.map((item: any) => (
                <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-xs text-foreground">
                    <div className="flex flex-col">
                      <span>{item.student?.name || "Student"}</span>
                      <span className="text-[10px] text-muted-foreground">{item.student?.email}</span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-xs">
                    <div className="flex flex-col">
                      <span className="font-bold text-primary">{item.advisor?.name || "Advisor"}</span>
                      <span className="text-[10px] text-muted-foreground">{item.advisor?.role} • {item.advisor?.email}</span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-xs max-w-xs">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(item.subjectCategory ? item.subjectCategory.split(",") : ["General Academic"]).map((sub: string, subIdx: number) => (
                          <Badge
                            key={subIdx}
                            variant="outline"
                            className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9.5px] font-bold"
                          >
                            {sub.trim()}
                          </Badge>
                        ))}
                        {item.drillQuota && (
                          <span
                            className="px-1.5 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20 text-[9.5px] font-bold"
                            title={`Remedial target: ${item.drillQuota} drill questions`}
                          >
                            🎯 {item.drillQuota} Qs
                          </span>
                        )}
                        {item.targetAccuracy && (
                          <span
                            className="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9.5px] font-bold"
                            title={`Passing target: ≥${item.targetAccuracy}% accuracy`}
                          >
                            ≥{item.targetAccuracy}%
                          </span>
                        )}
                        {item.deadline && (
                          <span
                            className="text-[9.5px] text-muted-foreground font-medium"
                            title={`Target completion deadline: ${new Date(item.deadline).toLocaleDateString()}`}
                          >
                            Due {new Date(item.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate" title={item.reason}>
                        "{item.reason}"
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase ${
                        item.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : item.status === "IN_PROGRESS"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}
                    >
                      {item.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden sm:table-cell text-[11px] text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAssignmentForEmail(item)}
                        className="h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer text-primary border-primary/30 hover:bg-primary/10 flex items-center gap-1"
                        title={`Reach out to ${item.student?.name || "student"} via email`}
                      >
                        <Mail size={12} />
                        <span>Reach Out</span>
                      </Button>
                      {item.status !== "RESOLVED" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: item.id, status: "RESOLVED", resolutionNotes: "Guidance completed successfully." })}
                          disabled={updateMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          <CheckCircle2 size={12} className="mr-1 inline" />
                          Mark Resolved
                        </Button>
                      )}
                      {item.status === "PENDING" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: item.id, status: "IN_PROGRESS" })}
                          disabled={updateMutation.isPending}
                          className="h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          Start Progress
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Integrated Pagination Footer */}
        {!isLoading && !isError && totalItems > 0 && (
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={ITEMS_PER_PAGE}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onPageSelect={handlePageSelect}
            itemLabel="guidance cases"
            variant="table-footer"
          />
        )}
      </div>

      {/* Email Student Outreach Modal */}
      {selectedAssignmentForEmail && (
        <EmailStudentModal
          isOpen={!!selectedAssignmentForEmail}
          onClose={() => setSelectedAssignmentForEmail(null)}
          student={selectedAssignmentForEmail.student}
          guidanceId={selectedAssignmentForEmail.id}
          defaultSubjectCategory={selectedAssignmentForEmail.subjectCategory}
        />
      )}
    </div>
  );
}

export default GuidanceAssignmentsDesk;
