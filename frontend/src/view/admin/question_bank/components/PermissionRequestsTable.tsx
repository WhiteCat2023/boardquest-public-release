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
import { Check, X, Clock, User, ShieldCheck, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export function PermissionRequestsTable() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  const [search, setSearch] = useState("");

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["permissionRequests", filterStatus],
    queryFn: async () => {
      const res = await axiosPrivate.get("/faculty/permission-requests", {
        params: { status: filterStatus !== "ALL" ? filterStatus : undefined },
      });
      return res.data?.data?.requests || [];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, reviewNote }: { id: string; status: "APPROVED" | "DECLINED"; reviewNote?: string }) => {
      const res = await axiosPrivate.put(`/faculty/permission-requests/${id}/review`, {
        status,
        reviewNote,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "APPROVED"
          ? "Permission request approved! Granted access to user."
          : "Permission request declined."
      );
      queryClient.invalidateQueries({ queryKey: ["permissionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to process permission request review.");
    },
  });

  const filteredRequests = (requestsData || []).filter((req: any) => {
    const userName = req.user?.name || "";
    const userEmail = req.user?.email || "";
    const reason = req.reason || "";
    const term = search.toLowerCase();
    return userName.toLowerCase().includes(term) || userEmail.toLowerCase().includes(term) || reason.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4 font-sans text-foreground">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            placeholder="Filter access requests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-xs bg-muted/30 border-border rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {["PENDING", "APPROVED", "DECLINED", "ALL"].map((st) => (
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
              {st === "PENDING" && <Clock size={12} className="mr-1 inline" />}
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
              <TableHead className="text-xs font-bold text-muted-foreground">Requestor</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">Current Role</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">Requested Access</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">Justification Reason</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground">Submitted</TableHead>
              <TableHead className="text-xs font-bold text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  Loading permission access requests...
                </TableCell>
              </TableRow>
            ) : filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                  No permission requests found for this filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((req: any) => (
                <TableRow key={req.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-semibold text-xs text-foreground">
                    <div className="flex flex-col">
                      <span>{req.user?.name || "Educator"}</span>
                      <span className="text-[10px] text-muted-foreground">{req.user?.email}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {req.user?.role}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-xs">
                    {req.targetQuestionId ? (
                      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] font-bold">
                        Co-Edit Question Q-{req.targetQuestionId.slice(-4).toUpperCase()}
                      </Badge>
                    ) : req.requestedRole ? (
                      <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-bold">
                        Role Elevation: {req.requestedRole}
                      </Badge>
                    ) : req.requestedCategoryIds?.length > 0 ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                        {req.requestedCategoryIds.length} Subject Category(s)
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Action Capabilities</span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs max-w-xs truncate text-muted-foreground" title={req.reason}>
                    "{req.reason}"
                  </TableCell>

                  <TableCell className="text-[11px] text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </TableCell>

                  <TableCell className="text-right">
                    {req.status === "PENDING" ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => reviewMutation.mutate({ id: req.id, status: "APPROVED" })}
                          disabled={reviewMutation.isPending}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          <Check size={12} className="mr-1 inline" />
                          Approve
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => reviewMutation.mutate({ id: req.id, status: "DECLINED" })}
                          disabled={reviewMutation.isPending}
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 h-7 px-2.5 text-[11px] font-bold rounded-lg cursor-pointer"
                        >
                          <X size={12} className="mr-1 inline" />
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold uppercase ${
                          req.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        {req.status}
                      </Badge>
                    )}
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

export default PermissionRequestsTable;
