import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Card } from "@/components/ui/card";
import { ShieldCheck, Search, Shield, KeyRound, Edit, Check, Clock, UserCheck } from "lucide-react";
import { PermissionRequestsTable } from "./components/PermissionRequestsTable";
import { EditPermissionModal } from "./components/EditPermissionModal";
import { useCategories } from "@/view/admin/faculty/hooks/useFaculty";

export function PermissionManagement() {
  const axiosPrivate = useAxiosPrivate();
  const [activeTab, setActiveTab] = useState<"MATRIX" | "REQUESTS">("MATRIX");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: faculties = [], isLoading } = useQuery({
    queryKey: ["faculties"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/faculty");
      return res.data?.data?.faculties || [];
    },
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["permissionRequests", "PENDING"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/faculty/permission-requests", {
        params: { status: "PENDING" },
      });
      return res.data?.data?.requests || [];
    },
  });

  const { data: categories = [] } = useCategories();

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const filteredFaculties = faculties.filter((f: any) => {
    const term = search.toLowerCase();
    return (
      (f.name || "").toLowerCase().includes(term) ||
      (f.email || "").toLowerCase().includes(term) ||
      (f.employeeId || "").toLowerCase().includes(term) ||
      (f.role || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto font-sans bg-background text-foreground animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="text-primary size-6" />
            Question Bank Permission Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure system roles, question bank action capabilities, and managed major subject categories for educators.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-muted/40 p-1 border border-border rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("MATRIX")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "MATRIX"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Shield size={14} className="inline mr-1.5" />
            Educator Permissions ({faculties.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("REQUESTS")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "REQUESTS"
                ? "bg-card text-foreground shadow-xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <KeyRound size={14} />
            Access Requests
            {requests.length > 0 && (
              <Badge variant="destructive" className="px-1.5 py-0 text-[10px] font-bold rounded-full">
                {requests.length}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {activeTab === "MATRIX" ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-2xl shadow-xs">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
              <Input
                placeholder="Search by educator name, email, employee ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs bg-muted/30 border-border rounded-xl"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Showing <strong className="text-foreground">{filteredFaculties.length}</strong> user profile(s)
            </span>
          </div>

          {/* Directory Table */}
          <div className="border border-border rounded-2xl bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs font-bold text-muted-foreground">Educator Name</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">System Role</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Managed Subjects</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground">Action Capabilities</TableHead>
                  <TableHead className="text-xs font-bold text-muted-foreground text-right">Configure</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      Loading user permission directory...
                    </TableCell>
                  </TableRow>
                ) : filteredFaculties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">
                      No user accounts found matching query.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFaculties.map((f: any) => {
                    const handledCount = f.handledCategoryIds?.length || f.handledCategories?.length || 0;
                    const perms = f.questionPermissions || {};
                    return (
                      <TableRow key={f.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell className="font-semibold text-xs text-foreground">
                          <div className="flex flex-col">
                            <span>{f.name}</span>
                            <span className="text-[10px] text-muted-foreground">{f.email} • ID: {f.employeeId || "N/A"}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              f.role === "SUPERADMIN"
                                ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                : f.role === "ADMIN"
                                ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                : f.role === "TEAMLEAD"
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {f.role}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-xs">
                          {handledCount > 0 ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold">
                              {handledCount} Major Subject Domain(s)
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">All Public / Shared</span>
                          )}
                        </TableCell>

                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted text-foreground">
                              {perms.canCreate !== false ? "Create: Yes" : "Create: No"}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted text-foreground">
                              {perms.canReview || f.role !== "TEACHER" ? "Review: Yes" : "Review: No"}
                            </Badge>
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-muted text-foreground">
                              {perms.canPublish || f.role !== "TEACHER" ? "Publish: Yes" : "Publish: No"}
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(f)}
                            className="h-7 text-xs px-2.5 rounded-lg cursor-pointer border-border hover:bg-accent font-semibold"
                          >
                            <Edit size={12} className="mr-1 inline text-primary" />
                            Edit Permissions
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <PermissionRequestsTable />
      )}

      {/* Edit Modal */}
      {selectedUser && (
        <EditPermissionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          availableCategories={categories}
        />
      )}
    </div>
  );
}

export default PermissionManagement;
