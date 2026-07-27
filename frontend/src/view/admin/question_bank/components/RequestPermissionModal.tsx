import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { KeyRound, ShieldAlert, Send, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface RequestPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetQuestionId?: string;
  targetAuthorName?: string;
  targetAuthorId?: string;
  questionTitle?: string;
  availableCategories?: Array<{ id: string; name: string }>;
}

export function RequestPermissionModal({
  isOpen,
  onClose,
  targetQuestionId,
  targetAuthorName,
  targetAuthorId,
  questionTitle,
  availableCategories = [],
}: RequestPermissionModalProps) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [requestType, setRequestType] = useState<"QUESTION_EDIT" | "SUBJECT_ACCESS" | "ROLE_ELEVATION">(
    targetQuestionId ? "QUESTION_EDIT" : "SUBJECT_ACCESS"
  );
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [requestedRole, setRequestedRole] = useState<string>("TEAMLEAD");
  const [reason, setReason] = useState("");

  const requestMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        reason: reason.trim(),
        targetQuestionId: targetQuestionId || undefined,
        targetUserId: targetAuthorId || undefined,
      };

      if (requestType === "ROLE_ELEVATION") {
        payload.requestedRole = requestedRole;
      } else if (requestType === "SUBJECT_ACCESS") {
        payload.requestedCategoryIds = selectedCategoryIds;
      } else if (requestType === "QUESTION_EDIT") {
        payload.requestedPermissions = { editQuestion: true };
      }

      const res = await axiosPrivate.post("/faculty/permission-requests", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Permission request submitted successfully! An admin or author will review it.");
      queryClient.invalidateQueries({ queryKey: ["permissionRequests"] });
      setReason("");
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit permission request.");
    },
  });

  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-card border border-border p-6 shadow-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <KeyRound size={20} />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {targetQuestionId ? "Request Edit Access" : "Request Question Bank Permission"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {targetQuestionId ? (
              <>
                Requesting co-editing permission for question{" "}
                <span className="font-semibold text-foreground">"{questionTitle?.slice(0, 40)}..."</span>{" "}
                authored by <span className="font-semibold text-foreground">{targetAuthorName || "Author"}</span>.
              </>
            ) : (
              "Submit a request to Administrators to grant subject categories, elevated roles, or specific editing permissions."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-xs">
          {/* Request Type Selector if not specific to a single question */}
          {!targetQuestionId && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Request Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRequestType("SUBJECT_ACCESS")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    requestType === "SUBJECT_ACCESS"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="text-xs font-bold">Subject Access</span>
                  <span className="text-[10px] font-normal opacity-80">Access major board subject domains</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRequestType("ROLE_ELEVATION")}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                    requestType === "ROLE_ELEVATION"
                      ? "border-primary bg-primary/5 text-primary font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                  }`}
                >
                  <span className="text-xs font-bold">Role Elevation</span>
                  <span className="text-[10px] font-normal opacity-80">Request Team Lead / Admin role</span>
                </button>
              </div>
            </div>
          )}

          {/* Subject Category Picker */}
          {requestType === "SUBJECT_ACCESS" && availableCategories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Subject Categories Requested</Label>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-border rounded-xl bg-muted/20">
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
          )}

          {/* Requested Role Picker */}
          {requestType === "ROLE_ELEVATION" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Requested System Role</Label>
              <select
                value={requestedRole}
                onChange={(e) => setRequestedRole(e.target.value)}
                className="w-full h-9 text-xs px-3 rounded-xl border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="TEAMLEAD">Subject Team Lead</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          )}

          {/* Reason Justification */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Reason / Justification <span className="text-destructive">*</span>
            </Label>
            <Textarea
              placeholder="Explain why you need this access (e.g. co-authoring question revisions, evaluating clinical microscopy items)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="text-xs bg-card border-border rounded-xl focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-9 text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => requestMutation.mutate()}
            disabled={!reason.trim() || requestMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 text-xs font-semibold flex items-center gap-1.5"
          >
            {requestMutation.isPending ? (
              <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-3.5 h-3.5" />
            ) : (
              <>
                <Send size={14} />
                Send Permission Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RequestPermissionModal;
