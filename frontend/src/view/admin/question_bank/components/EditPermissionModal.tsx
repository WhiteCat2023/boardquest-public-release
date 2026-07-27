import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Shield, Save, CheckCircle2, UserCheck, Wrench } from "lucide-react";
import { toast } from "sonner";

export interface EditPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  availableCategories?: Array<{ id: string; name: string }>;
}

export function EditPermissionModal({
  isOpen,
  onClose,
  user,
  availableCategories = [],
}: EditPermissionModalProps) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [role, setRole] = useState<string>("TEACHER");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [canCreate, setCanCreate] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [canPublish, setCanPublish] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role || "TEACHER");
      setSelectedCategoryIds(user.handledCategoryIds || user.handledCategories?.map((c: any) => c.id) || []);
      const perms = user.questionPermissions || {};
      setCanCreate(perms.canCreate !== false);
      setCanReview(perms.canReview || user.role === "TEAMLEAD" || user.role === "ADMIN" || user.role === "SUPERADMIN");
      setCanApprove(perms.canApprove || user.role === "TEAMLEAD" || user.role === "ADMIN" || user.role === "SUPERADMIN");
      setCanPublish(perms.canPublish || user.role === "TEAMLEAD" || user.role === "ADMIN" || user.role === "SUPERADMIN");
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        role,
        handledCategoryIds: selectedCategoryIds,
        questionPermissions: {
          canCreate,
          canReview,
          canApprove,
          canPublish,
        },
      };
      const res = await axiosPrivate.put(`/faculty/${user.id}/permissions`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Updated permissions for ${user?.name || "user"}`);
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update user permissions.");
    },
  });

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const applyPreset = (preset: "TEACHER" | "TEAMLEAD" | "ADMIN") => {
    if (preset === "TEACHER") {
      setRole("TEACHER");
      setCanCreate(true);
      setCanReview(false);
      setCanApprove(false);
      setCanPublish(false);
    } else if (preset === "TEAMLEAD") {
      setRole("TEAMLEAD");
      setCanCreate(true);
      setCanReview(true);
      setCanApprove(true);
      setCanPublish(true);
    } else if (preset === "ADMIN") {
      setRole("ADMIN");
      setCanCreate(true);
      setCanReview(true);
      setCanApprove(true);
      setCanPublish(true);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl rounded-2xl bg-card border border-border p-6 shadow-lg">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <Shield size={20} />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Manage User Permissions
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure system role, question bank capabilities, and assigned subject domains for{" "}
            <span className="font-bold text-foreground">{user.name}</span> ({user.email}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2 text-xs">
          {/* Preset Buttons */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Preset Templates</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("TEACHER")} className="h-7 text-xs rounded-xl">
                Educator Preset
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("TEAMLEAD")} className="h-7 text-xs rounded-xl">
                Team Lead Preset
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => applyPreset("ADMIN")} className="h-7 text-xs rounded-xl">
                Admin Preset
              </Button>
            </div>
          </div>

          {/* System Role Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">System Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-9 text-xs px-3 rounded-xl border border-border bg-card text-foreground focus:ring-1 focus:ring-primary font-bold"
            >
              <option value="TEACHER">TEACHER (Educator)</option>
              <option value="TEAMLEAD">TEAMLEAD (Subject Lead)</option>
              <option value="ADMIN">ADMIN (Administrator)</option>
              <option value="SUPERADMIN">SUPERADMIN (Super Administrator)</option>
            </select>
          </div>

          {/* Action Capabilities */}
          <div className="space-y-3 p-3.5 border border-border/80 rounded-2xl bg-muted/20">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Question Bank Action Capabilities</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card">
                <span className="text-xs font-medium">Create Questions</span>
                <Switch checked={canCreate} onCheckedChange={setCanCreate} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card">
                <span className="text-xs font-medium">Review & Request Revisions</span>
                <Switch checked={canReview} onCheckedChange={setCanReview} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card">
                <span className="text-xs font-medium">Approve Questions</span>
                <Switch checked={canApprove} onCheckedChange={setCanApprove} />
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card">
                <span className="text-xs font-medium">Publish Questions</span>
                <Switch checked={canPublish} onCheckedChange={setCanPublish} />
              </div>
            </div>
          </div>

          {/* Assigned Managed Categories */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Managed Major Subject Categories</Label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 border border-border rounded-xl bg-muted/20">
              {availableCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <Badge
                    key={cat.id}
                    variant="outline"
                    onClick={() => toggleCategory(cat.id)}
                    className={`cursor-pointer text-[11px] px-2.5 py-1 rounded-lg transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary font-bold"
                        : "bg-card hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {isSelected && <CheckCircle2 size={12} className="mr-1" />}
                    {cat.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-9 text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 text-xs font-semibold flex items-center gap-1.5"
          >
            {updateMutation.isPending ? (
              <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-3.5 h-3.5" />
            ) : (
              <>
                <Save size={14} />
                Save Permission Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EditPermissionModal;
