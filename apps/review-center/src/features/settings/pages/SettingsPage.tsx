import React, { useState } from "react";
import {
  Building2,
  Mail,
  MapPin,
  User,
  Phone,
  ShieldCheck,
  Pencil,
  KeyRound,
  Eye,
  EyeOff,
  Info,
  Loader2,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";

export function SettingsPage() {
  const { user, updateProfile } = useReviewCenterAuth();

  // Modal open states
  const [isEditRepOpen, setIsEditRepOpen] = useState(false);
  const [isEditOrgOpen, setIsEditOrgOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Loading states
  const [isSavingRep, setIsSavingRep] = useState(false);
  const [isSavingOrg, setIsSavingOrg] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Form states - Representative
  const [repName, setRepName] = useState("");
  const [repEmployeeId, setRepEmployeeId] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repLocation, setRepLocation] = useState("");

  // Form states - Organization
  const [orgName, setOrgName] = useState("");
  const [orgLocation, setOrgLocation] = useState("");

  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const handleOpenEditRep = () => {
    setRepName(user?.name || "");
    setRepEmployeeId(user?.employeeId || "");
    setRepPhone(user?.phonenumber || "");
    setRepLocation(user?.location || "");
    setIsEditRepOpen(true);
  };

  const handleOpenEditOrg = () => {
    setOrgName(user?.companyName || user?.reviewCenter?.name || "");
    setOrgLocation(
      user?.location || user?.reviewCenter?.location || "Philippines",
    );
    setIsEditOrgOpen(true);
  };

  const handleOpenChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPw(false);
    setShowNewPw(false);
    setShowConfirmPw(false);
    setIsChangePasswordOpen(true);
  };

  const handleSaveRep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repName.trim()) {
      toast.error("Representative name cannot be empty.");
      return;
    }
    if (!repEmployeeId.trim()) {
      toast.error("Employee ID / Reference code cannot be empty.");
      return;
    }

    try {
      setIsSavingRep(true);
      await updateProfile({
        name: repName.trim(),
        employeeId: repEmployeeId.trim(),
        phonenumber: repPhone.trim(),
        location: repLocation.trim(),
      });
      toast.success("Representative details updated successfully!");
      setIsEditRepOpen(false);
    } catch (err: any) {
      toast.error(
        err.message || "Failed to update representative information.",
      );
    } finally {
      setIsSavingRep(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error("Organization name cannot be empty.");
      return;
    }

    try {
      setIsSavingOrg(true);
      await updateProfile({
        companyName: orgName.trim(),
        location: orgLocation.trim(),
      });
      toast.success("Organization details updated successfully!");
      setIsEditOrgOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update organization details.");
    } finally {
      setIsSavingOrg(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    try {
      setIsSavingPassword(true);
      await updateProfile({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully!");
      setIsChangePasswordOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl w-full mx-auto font-sans pb-10">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Portal & Organization Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          View and edit your partner review center profile, representative
          credentials, and connection details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Representative Profile Card */}
        <Card className="rounded-3xl border-border bg-card shadow-2xs">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="size-4 text-primary" /> Representative
                  Information
                </CardTitle>
                <CardDescription>
                  Your authenticated partner representative account.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-0.5"
                >
                  ACTIVE
                </Badge>
                <Button
                  id="edit-representative-btn"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEditRep}
                  className="h-8 rounded-xl font-bold gap-1.5 text-xs border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Pencil className="size-3.5 text-primary" />
                  Edit Info
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Full Name
                </span>
                <span className="font-bold text-foreground text-sm">
                  {user?.name || "Representative"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Employee ID / Ref
                </span>
                <span className="font-mono font-bold text-primary text-sm">
                  {user?.employeeId || "RC-REPRESENTATIVE"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Email Address
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 truncate">
                  <Mail className="size-3.5 text-primary shrink-0" />{" "}
                  {user?.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Role Authority
                </span>
                <span className="font-bold text-foreground">
                  Review Center Partner (External)
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Contact Phone
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5 text-primary shrink-0" />
                  {user?.phonenumber || (
                    <span className="text-muted-foreground font-normal italic">
                      None provided
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Location / Address
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary shrink-0" />
                  {user?.location || "Philippines"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Center Details */}
        <Card className="rounded-3xl border-border bg-card shadow-2xs">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Building2 className="size-4 text-primary" /> Partner
                  Organization
                </CardTitle>
                <CardDescription>
                  Registered review center institution on the BoardQuest
                  network.
                </CardDescription>
              </div>
              <div>
                <Button
                  id="edit-organization-btn"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEditOrg}
                  className="h-8 rounded-xl font-bold gap-1.5 text-xs border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <Pencil className="size-3.5 text-primary" />
                  Edit Organization
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Company / Organization Name
                </span>
                <span className="font-bold text-foreground text-sm">
                  {user?.companyName ||
                    user?.reviewCenter?.name ||
                    "Review Center"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Headquarters Location
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary shrink-0" />{" "}
                  {user?.location ||
                    user?.reviewCenter?.location ||
                    "Philippines"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Network Linkage
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                  Synced with BoardQuest Dean & Faculty Hub
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Data Synchronization
                </span>
                <span className="text-muted-foreground font-medium">
                  Student rosters and cohort assessments automatically link to
                  this organization.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security & Authentication Card */}
        <Card className="rounded-3xl border-border bg-card shadow-2xs">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" /> Security &
                  Password
                </CardTitle>
                <CardDescription>
                  Manage your credentials and password for the Review Center
                  Portal.
                </CardDescription>
              </div>
              <div>
                <Button
                  id="change-password-btn"
                  variant="outline"
                  size="sm"
                  onClick={handleOpenChangePassword}
                  className="h-8 rounded-xl font-bold gap-1.5 text-xs border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                >
                  <KeyRound className="size-3.5 text-primary" />
                  Change Password
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Password Protection
                </span>
                <span className="font-mono text-foreground font-bold tracking-widest text-sm">
                  ••••••••••••
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Encryption Standard
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Lock className="size-3.5 text-primary shrink-0" />
                  Bcrypt Hashed & Salted
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Modal 1: Edit Representative Profile ── */}
      <Dialog open={isEditRepOpen} onOpenChange={setIsEditRepOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <User className="size-4 text-primary" /> Edit Representative
              Information
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update your personal representative profile details and contact
              number.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveRep} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="rep-name" className="text-xs font-bold">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rep-name"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="e.g. Dennis Fabian"
                className="text-xs font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rep-employeeId" className="text-xs font-bold">
                Employee ID / Reference Code{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="rep-employeeId"
                value={repEmployeeId}
                onChange={(e) => setRepEmployeeId(e.target.value)}
                placeholder="e.g. RC - 8454"
                className="text-xs font-mono font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rep-phone" className="text-xs font-bold">
                Phone / Contact Number
              </Label>
              <Input
                id="rep-phone"
                value={repPhone}
                onChange={(e) => setRepPhone(e.target.value)}
                placeholder="e.g. +63 912 345 6789"
                className="text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rep-location" className="text-xs font-bold">
                Location / City
              </Label>
              <Input
                id="rep-location"
                value={repLocation}
                onChange={(e) => setRepLocation(e.target.value)}
                placeholder="e.g. Dagupan City, Pangasinan"
                className="text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="rep-email"
                className="text-xs font-bold text-muted-foreground"
              >
                Email Address
              </Label>
              <Input
                id="rep-email"
                value={user?.email || ""}
                disabled
                className="text-xs bg-muted/60 text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                <Info className="size-3 text-primary shrink-0" />
                Login email cannot be modified directly. Contact administrative
                support if changes are required.
              </p>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditRepOpen(false)}
                disabled={isSavingRep}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                id="save-representative-btn"
                type="submit"
                size="sm"
                disabled={isSavingRep}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {isSavingRep ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal 2: Edit Partner Organization ── */}
      <Dialog open={isEditOrgOpen} onOpenChange={setIsEditOrgOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <Building2 className="size-4 text-primary" /> Edit Partner
              Organization
            </DialogTitle>
            <DialogDescription className="text-xs">
              Update registered institution name and headquarters location.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveOrg} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="org-name" className="text-xs font-bold">
                Company / Organization Name{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Inday Review Center"
                className="text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="org-location" className="text-xs font-bold">
                Headquarters Location{" "}
                <span className="text-destructive">*</span>
              </Label>
              <Input
                id="org-location"
                value={orgLocation}
                onChange={(e) => setOrgLocation(e.target.value)}
                placeholder="e.g. Philippines"
                className="text-xs font-semibold"
                required
              />
            </div>

            <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
              <Info className="size-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>Automatic Synchronization:</strong> Updating your
                organization name will automatically synchronize across all your
                enrolled candidates, cohorts, and assessment records.
              </span>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOrgOpen(false)}
                disabled={isSavingOrg}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                id="save-organization-btn"
                type="submit"
                size="sm"
                disabled={isSavingOrg}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {isSavingOrg ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Organization"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal 3: Change Password ── */}
      <Dialog
        open={isChangePasswordOpen}
        onOpenChange={setIsChangePasswordOpen}
      >
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black flex items-center gap-2">
              <KeyRound className="size-4 text-primary" /> Change Account
              Password
            </DialogTitle>
            <DialogDescription className="text-xs">
              Enter your current password and choose a secure new password (min.
              6 characters).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSavePassword} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="current-pw" className="text-xs font-bold">
                Current Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="text-xs font-medium pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="new-pw" className="text-xs font-bold">
                New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="text-xs font-medium pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm-pw" className="text-xs font-bold">
                Confirm New Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirm-pw"
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="text-xs font-medium pr-10"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPw ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsChangePasswordOpen(false)}
                disabled={isSavingPassword}
                className="rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                id="submit-change-password-btn"
                type="submit"
                size="sm"
                disabled={isSavingPassword}
                className="rounded-xl text-xs font-bold gap-1.5"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SettingsPage;
