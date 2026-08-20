import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Save,
  CheckCircle2,
  Lock,
  UserCheck,
  Building2,
  IdCard,
  Calendar,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

function ProfileSettings() {
  const { auth, setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const user = (auth as any)?.data?.user || {};

  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all required profile fields.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const response = await axiosPrivate.put("/auth/profile", {
        name,
        email,
        phoneNumber,
      });

      const updatedUser = response.data?.data?.user || { ...user, name, email, phoneNumber };

      setAuth((prev: any) => ({
        ...prev,
        data: {
          ...prev?.data,
          user: updatedUser,
        },
      }));

      toast.success("Profile information updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    setIsSavingPassword(true);
    try {
      await axiosPrivate.put("/auth/profile", {
        password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Security password updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password.");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-3xl mx-auto font-sans pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-border">
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
            <UserCheck size={22} className="stroke-[2.5]" />
          </div>
          Profile & Account Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal information, contact credentials, and security credentials.
        </p>
      </div>

      {/* Vertical Block 1: Profile Overview Summary */}
      <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative shrink-0">
          <Avatar className="h-24 w-24 rounded-2xl border-2 border-primary/20 bg-primary/10 text-primary shadow-xs">
            <AvatarFallback className="font-bold text-3xl uppercase bg-primary/10 text-primary rounded-2xl">
              {(name || user.name || "U").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <span
            className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 border-2 border-card ring-2 ring-emerald-400/20"
            title="Account Active"
          />
        </div>

        <div className="flex flex-col gap-2.5 items-center md:items-start text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h2 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
              {name || user.name || "Account Profile"}
            </h2>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/20 text-xs font-bold uppercase tracking-wider px-3 py-0.5 rounded-full"
            >
              <Shield size={12} className="mr-1.5" />
              {user.role || "ADMINISTRATOR"}
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground font-medium">
            {email || user.email || "email@university.edu"}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-xl border border-border font-medium">
              <Building2 size={13} className="text-primary" />
              {user.department?.name || "Academic Department"}
            </span>
            <span className="flex items-center gap-1.5 bg-muted px-3 py-1.5 rounded-xl border border-border font-medium">
              <IdCard size={13} className="text-primary" />
              Employee ID: {user.employeeId || "SA-0001"}
            </span>
          </div>
        </div>
      </Card>

      {/* Vertical Block 2: Personal Information Form */}
      <Card className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
        <CardHeader className="border-b border-border pb-4 pt-6 px-6 md:px-8 bg-card">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <User size={18} className="text-primary" />
            Personal Details
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Update your primary display name, email address, and contact phone number.
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
            {/* Full Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User size={13} className="text-primary" /> Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                required
              />
              <span className="text-[11px] text-muted-foreground">This name will be displayed across administrative records and activity logs.</span>
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={13} className="text-primary" /> Email Address <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                required
              />
              <span className="text-[11px] text-muted-foreground font-medium">Used for system login, password recovery, and email notifications.</span>
            </div>

            {/* Phone Number */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={13} className="text-primary" /> Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. +63 917 123 4567"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end pt-3 border-t border-border mt-2">
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Save size={15} />
                {isSavingProfile ? "Saving Details..." : "Save Personal Details"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vertical Block 3: Security & Password Update */}
      <Card className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden flex flex-col">
        <CardHeader className="border-b border-border pb-4 pt-6 px-6 md:px-8 bg-card">
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Lock size={18} className="text-primary" />
            Security & Password Update
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Keep your administrative account protected by updating your security password.
          </p>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleUpdatePassword} className="flex flex-col gap-6">
            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound size={13} className="text-primary" /> Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
              />
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={13} className="text-primary" /> New Password <span className="text-primary">*</span>
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min. 6 characters)"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                required
              />
            </div>

            {/* Confirm New Password */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-primary" /> Confirm New Password <span className="text-primary">*</span>
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-11 px-4 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all"
                required
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end pt-3 border-t border-border mt-2">
              <Button
                type="submit"
                disabled={isSavingPassword}
                className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-6 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Save size={15} />
                {isSavingPassword ? "Updating Password..." : "Update Security Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Vertical Block 4: Read-Only System Account Information */}
      <Card className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-5">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <Sparkles size={18} className="text-primary" />
          <h3 className="text-base font-bold text-foreground">
            Account Status & System Scope
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 p-4 bg-muted/40 rounded-2xl border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Shield size={12} className="text-primary" /> Assigned Role
            </span>
            <span className="text-sm font-bold text-foreground">
              {user.role || "ADMINISTRATOR"}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-muted/40 rounded-2xl border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500" /> Account Status
            </span>
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Active &amp; Authorized
            </span>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-muted/40 rounded-2xl border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Building2 size={12} className="text-primary" /> Department Scope
            </span>
            <span className="text-sm font-bold text-foreground capitalize">
              {user.department?.name || "Executive Academic Division"}
            </span>
          </div>

          <div className="flex flex-col gap-1 p-4 bg-muted/40 rounded-2xl border border-border">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar size={12} className="text-primary" /> Security Status
            </span>
            <span className="text-sm font-bold text-foreground">
              Standard Credentials
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfileSettings;