import { useState } from "react";
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
import { CheckCircle2, Search } from "lucide-react";
import { toast } from "sonner";

export function GuidanceAssignmentsDesk() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const { data: assignments = [], isLoading } = useQuery({
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
      toast.success("Guidance case status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["guidanceAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["failingStudents"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update guidance status.");
    },
  });

  const filteredAssignments = assignments;

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
            ) : filteredAssignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  No guidance assignments found matching filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredAssignments.map((item: any) => (
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

                  <TableCell className="hidden sm:table-cell text-xs max-w-xs truncate">
                    <div className="flex flex-col">
                      <Badge variant="outline" className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9.5px] font-bold">
                        {item.subjectCategory || "General Academic"}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground truncate mt-0.5" title={item.reason}>
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
      </div>
    </div>
  );
}

export default GuidanceAssignmentsDesk;
