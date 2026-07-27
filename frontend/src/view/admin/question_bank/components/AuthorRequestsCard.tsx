import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KeyRound, Check, X, User } from "lucide-react";
import { toast } from "sonner";

export function AuthorRequestsCard() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const currentUserId = currentUser?.id || (auth as any)?.data?.id || (auth as any)?.id;

  const { data: requests = [] } = useQuery({
    queryKey: ["authorPermissionRequests", currentUserId],
    queryFn: async () => {
      const res = await axiosPrivate.get("/faculty/permission-requests", {
        params: { status: "PENDING", targetUserId: currentUserId },
      });
      return res.data?.data?.requests || [];
    },
    enabled: Boolean(currentUserId),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "APPROVED" | "DECLINED" }) => {
      const res = await axiosPrivate.put(`/faculty/permission-requests/${id}/review`, {
        status,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === "APPROVED"
          ? "Granted edit access to colleague!"
          : "Edit access request declined."
      );
      queryClient.invalidateQueries({ queryKey: ["authorPermissionRequests"] });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update access request.");
    },
  });

  if (!requests || requests.length === 0) return null;

  return (
    <Card className="bg-primary/5 border border-primary/20 p-4 rounded-2xl flex flex-col gap-3 font-sans shadow-xs">
      <div className="flex items-center gap-2 text-primary font-bold text-xs">
        <KeyRound size={16} />
        <span>Incoming Collaboration Requests ({requests.length})</span>
      </div>

      <div className="space-y-2">
        {requests.map((req: any) => (
          <div
            key={req.id}
            className="p-3 bg-card border border-border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <User size={14} className="text-muted-foreground" />
                <span>{req.user?.name || "Colleague"}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 uppercase">
                  {req.user?.role}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground italic">
                "{req.reason}"
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                type="button"
                size="sm"
                onClick={() => reviewMutation.mutate({ id: req.id, status: "APPROVED" })}
                disabled={reviewMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 px-3 text-[11px] font-bold rounded-lg cursor-pointer"
              >
                <Check size={12} className="mr-1 inline" />
                Grant Edit Access
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reviewMutation.mutate({ id: req.id, status: "DECLINED" })}
                disabled={reviewMutation.isPending}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 h-7 px-3 text-[11px] font-bold rounded-lg cursor-pointer"
              >
                <X size={12} className="mr-1 inline" />
                Decline
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default AuthorRequestsCard;
