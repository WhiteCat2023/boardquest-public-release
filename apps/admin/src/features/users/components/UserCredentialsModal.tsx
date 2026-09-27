import { CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface UserCredentialsInfo {
  name: string;
  email: string;
  employeeId?: string;
  companyName?: string;
  temporaryPassword?: string;
  role?: string;
  portalUrl?: string;
}

interface UserCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: UserCredentialsInfo | null;
}

export default function UserCredentialsModal({
  isOpen,
  onClose,
  credentials,
}: UserCredentialsModalProps) {
  if (!credentials) return null;

  const handleCopyCredentials = () => {
    const text = `BoardQuest Portal Access Credentials\n--------------------------------\nOrganization: ${credentials.companyName || "BoardQuest"}\nName: ${credentials.name}\nLogin Email / ID: ${credentials.email}\nTemporary Password: ${credentials.temporaryPassword || "N/A"}\nPortal Link: ${credentials.portalUrl || window.location.origin}`;
    navigator.clipboard.writeText(text);
    toast.success("Credentials copied to clipboard!");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 bg-card border border-border rounded-3xl shadow-2xl text-foreground font-sans">
        <DialogHeader className="items-center text-center space-y-2">
          <div className="size-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="size-6 stroke-[2.5]" />
          </div>
          <div>
            <DialogTitle className="text-base font-extrabold text-foreground tracking-tight">
              {credentials.role === "EXTERNAL"
                ? "Review Center Account Ready"
                : "User Account Ready"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Account registered successfully. Below are the assigned login credentials.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Credentials Box */}
          <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2.5">
            {credentials.companyName && (
              <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
                <span className="text-muted-foreground font-semibold">
                  Partner Center:
                </span>
                <span className="font-bold text-foreground">
                  {credentials.companyName}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">
                Representative / Name:
              </span>
              <span className="font-bold text-foreground">
                {credentials.name}
              </span>
            </div>
            {credentials.employeeId && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">
                  Partner / Employee ID:
                </span>
                <span className="font-mono font-bold text-foreground">
                  {credentials.employeeId}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">
                Login Email:
              </span>
              <span className="font-bold text-foreground">
                {credentials.email}
              </span>
            </div>
            {credentials.temporaryPassword && (
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <span className="text-muted-foreground font-semibold">
                  Temporary Password:
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                    {credentials.temporaryPassword}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyCredentials}
              className="w-full flex items-center justify-center gap-2 cursor-pointer h-9 text-xs font-bold"
            >
              <Copy className="size-3.5" />
              Copy All Credentials &amp; Portal Link
            </Button>

            <Button
              type="button"
              onClick={onClose}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer h-9 text-xs font-bold rounded-xl shadow-xs"
            >
              Done &amp; Back to User Directory
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
