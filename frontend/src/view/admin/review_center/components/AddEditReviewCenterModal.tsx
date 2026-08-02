import { useState, useEffect } from "react";
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  BadgeCheck, 
  Lock,
  Loader2 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import type { ReviewCenterRepresentative } from "../types";
import { useCreateReviewCenter, useUpdateReviewCenter } from "../hooks/useReviewCenter";

interface AddEditReviewCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ReviewCenterRepresentative | null;
}

export default function AddEditReviewCenterModal({
  isOpen,
  onClose,
  initialData,
}: AddEditReviewCenterModalProps) {
  const isEditing = !!initialData;

  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");

  const createMutation = useCreateReviewCenter();
  const updateMutation = useUpdateReviewCenter();

  useEffect(() => {
    if (initialData) {
      setCompanyName(initialData.companyName || "");
      setName(initialData.name || "");
      setEmployeeId(initialData.employeeId || "");
      setEmail(initialData.email || "");
      setPhonenumber(initialData.phonenumber || "");
      setLocation(initialData.location || "Philippines");
      setPassword("");
    } else {
      setCompanyName("");
      setName("");
      setEmployeeId(`RC-${Math.floor(1000 + Math.random() * 9000)}`);
      setEmail("");
      setPhonenumber("");
      setLocation("Philippines");
      setPassword("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      toast.error("Review Center / Company name is required.");
      return;
    }
    if (!name.trim()) {
      toast.error("Representative name is required.");
      return;
    }
    if (!email.trim()) {
      toast.error("Contact email address is required.");
      return;
    }

    if (isEditing && initialData) {
      updateMutation.mutate(
        {
          id: initialData.id,
          data: {
            companyName,
            name,
            employeeId,
            email,
            phonenumber,
            location,
          },
        },
        {
          onSuccess: () => {
            toast.success("Review Center details updated successfully!");
            onClose();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update review center.");
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          companyName,
          name,
          employeeId,
          email,
          phonenumber,
          location,
          password: password || "ReviewCenter123!",
        },
        {
          onSuccess: () => {
            toast.success("New Review Center representative added successfully!");
            onClose();
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create review center.");
          },
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl sm:max-w-xl w-full text-foreground font-sans">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2.5">
            <Building2 className="text-primary" size={22} />
            {isEditing ? "Edit Review Center Details" : "Add Review Center Representative"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {isEditing
              ? "Update partner organization details and representative contact information."
              : "Register a new affiliated review center institution and representative user account."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Review Center Company Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Building2 size={14} className="text-muted-foreground" />
              Review Center / Organization Name *
            </label>
            <Input
              type="text"
              placeholder="e.g. Apex Medical Review Center"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Representative Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User size={14} className="text-muted-foreground" />
                Representative Name *
              </label>
              <Input
                type="text"
                placeholder="e.g. Dr. Roberto Santos"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Employee ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <BadgeCheck size={14} className="text-muted-foreground" />
                Employee / Partner ID
              </label>
              <Input
                type="text"
                placeholder="e.g. RC-2026-001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Mail size={14} className="text-muted-foreground" />
                Email Address *
              </label>
              <Input
                type="email"
                placeholder="e.g. contact@apexreview.ph"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Phone size={14} className="text-muted-foreground" />
                Phone Number
              </label>
              <Input
                type="text"
                placeholder="e.g. +63 917 555 1234"
                value={phonenumber}
                onChange={(e) => setPhonenumber(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MapPin size={14} className="text-muted-foreground" />
                Location / Branch
              </label>
              <Input
                type="text"
                placeholder="e.g. Manila, Philippines"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
              />
            </div>

            {/* Password (for new user creation) */}
            {!isEditing && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Lock size={14} className="text-muted-foreground" />
                  Initial Password
                </label>
                <Input
                  type="password"
                  placeholder="Defaults to ReviewCenter123!"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground"
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-10 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 cursor-pointer flex items-center gap-2 shadow-xs"
            >
              {isSubmitting && <Spinner size="sm" variant="current" />}
              {isEditing ? "Save Changes" : "Create Review Center"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
