import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Shield,
  KeyRound,
  Save,
  CheckCircle2,
  Lock,
  IdCard,
  ArrowLeft,
  Eye,
  EyeOff,
  Key,
  AlertCircle,
  Pencil,
  X,
  Camera,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

type ProfileTab = "details" | "security";

export function ProfileSettings() {
  const { auth, setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const user = (auth as any)?.data?.user || {};

  const [activeTab, setActiveTab] = useState<ProfileTab>("details");

  // Avatar states
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [employeeId, setEmployeeId] = useState(user.employeeId || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (user.name) setName(user.name);
    if (user.email) setEmail(user.email);
    if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
    if (user.employeeId) setEmployeeId(user.employeeId);
    if (user.avatarUrl !== undefined) setAvatarUrl(user.avatarUrl || null);
  }, [user.name, user.email, user.phoneNumber, user.employeeId, user.avatarUrl]);

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Dynamic initials
  const initials = (name || user.name || "AD").slice(0, 2).toUpperCase();

  // Password strength score (0 - 100)
  const passwordStrength = useMemo(() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 25;
    if (newPassword.length >= 10) score += 25;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 25;
    if (/[0-9]/.test(newPassword) || /[^A-Za-z0-9]/.test(newPassword)) score += 25;
    return score;
  }, [newPassword]);

  const passwordStrengthLabel = useMemo(() => {
    if (passwordStrength === 0) return { text: "Too Short", color: "text-muted-foreground", barColor: "bg-muted" };
    if (passwordStrength <= 25) return { text: "Weak", color: "text-rose-500", barColor: "bg-rose-500" };
    if (passwordStrength <= 50) return { text: "Fair", color: "text-amber-500", barColor: "bg-amber-500" };
    if (passwordStrength <= 75) return { text: "Good", color: "text-indigo-500", barColor: "bg-indigo-500" };
    return { text: "Strong", color: "text-emerald-500", barColor: "bg-emerald-500" };
  }, [passwordStrength]);

  const handleCancelEdit = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setPhoneNumber(user.phoneNumber || "");
    setEmployeeId(user.employeeId || "");
    setIsEditingProfile(false);
  };

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
        employeeId,
      });

      const updatedUser = response.data?.data?.user || { ...user, name, email, phoneNumber, employeeId };

      setAuth((prev: any) => ({
        ...prev,
        data: {
          ...prev?.data,
          user: updatedUser,
        },
      }));

      toast.success("Profile information updated successfully!");
      setIsEditingProfile(false);
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

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the user can re-select the same file if needed
    e.target.value = "";

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5MB.");
      return;
    }

    setIsUploadingAvatar(true);
    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const base64String = reader.result as string;

        // 1. Upload to Supabase Storage via backend upload endpoint
        const uploadRes = await axiosPrivate.post("/upload/profile-picture", {
          image: base64String,
          fileName: file.name,
        });

        const uploadedUrl =
          uploadRes.data?.data?.imageUrl || uploadRes.data?.imageUrl;

        if (!uploadedUrl) {
          throw new Error("Failed to receive image URL from server.");
        }

        // 2. Persist avatarUrl to admin user record
        const response = await axiosPrivate.put("/auth/profile", {
          avatarUrl: uploadedUrl,
        });

        const updatedUser = response.data?.data?.user || {
          ...user,
          avatarUrl: uploadedUrl,
        };

        // 3. Update global auth state
        setAuth((prev: any) => ({
          ...prev,
          data: {
            ...prev?.data,
            user: updatedUser,
          },
        }));

        setAvatarUrl(uploadedUrl);
        toast.success("Profile picture updated successfully!");
      } catch (err: any) {
        toast.error(
          err.response?.data?.message ||
            err.message ||
            "Failed to upload profile picture."
        );
      } finally {
        setIsUploadingAvatar(false);
      }
    };

    reader.onerror = () => {
      setIsUploadingAvatar(false);
      toast.error("Failed to read image file.");
    };

    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    setIsUploadingAvatar(true);
    try {
      const response = await axiosPrivate.put("/auth/profile", {
        avatarUrl: null,
      });

      const updatedUser = response.data?.data?.user || {
        ...user,
        avatarUrl: null,
      };

      setAuth((prev: any) => ({
        ...prev,
        data: {
          ...prev?.data,
          user: updatedUser,
        },
      }));

      setAvatarUrl(null);
      toast.success("Profile picture removed successfully.");
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to remove profile picture."
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const NAV_TABS = [
    { id: "details" as ProfileTab, label: "Personal Details", icon: User },
    { id: "security" as ProfileTab, label: "Security & Password", icon: Lock },
  ];

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 md:p-6 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans bg-background text-foreground pb-20">
      {/* 1. Header with Avatar, Name, Role & Status Badges, and Right Actions */}
      <div className="flex flex-col gap-2.5">
        {/* Back navigation button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit"
        >
          <ArrowLeft size={14} />
          <span>Back to Previous Page</span>
        </button>

        {/* Main Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
          {/* Left Side: Avatar, Name, Role Badges & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative shrink-0 group self-start">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border-2 border-border shadow-xs bg-muted text-foreground overflow-hidden">
                {avatarUrl ? (
                  <AvatarImage
                    src={avatarUrl}
                    alt={name || user.name}
                    className="object-cover size-full"
                  />
                ) : null}
                <AvatarFallback className="font-black text-xl sm:text-2xl bg-primary/10 text-primary uppercase rounded-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Hover camera upload overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute inset-0 rounded-2xl bg-black/55 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-xs disabled:cursor-not-allowed"
                title="Change profile picture"
              >
                {isUploadingAvatar ? (
                  <Loader2 size={20} className="animate-spin text-white" />
                ) : (
                  <>
                    <Camera size={18} className="stroke-[2.5]" />
                    <span className="text-[9.5px] font-bold mt-1">Change</span>
                  </>
                )}
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAvatar();
                  }}
                  disabled={isUploadingAvatar}
                  className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-xs hover:bg-destructive/90 z-20"
                  title="Remove profile picture"
                >
                  <Trash2 size={10} />
                </button>
              )}

              <span
                className="absolute -bottom-1 -right-1 size-3.5 sm:size-4 rounded-full bg-emerald-500 border-2 border-card ring-2 ring-emerald-400/20 z-10"
                title="Account Active"
              />
            </div>

            <div className="space-y-1.5 min-w-0">
              {/* Name + Role & Status Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight capitalize truncate">
                  {name || user.name || "Administrator"}
                </h1>
              </div>

              {/* Subtitle: Email, Administrative Scope, Location */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground font-medium">
                <span className="truncate">{email || user.email || "email@university.edu"}</span>
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            className="sr-only hidden"
            onChange={handleAvatarFileSelect}
          />
        </div>
      </div>

      {/* Navigation Tabs Bar (Underline / Minimalist Style) */}
      <div className="border-b border-border flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none pt-1">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap border-b-2 -mb-[1px] ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab 1: PERSONAL DETAILS */}
      {activeTab === "details" && (
        <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
          {!isEditingProfile ? (
            /* VIEW MODE: EXACT RECREATION OF USER'S REFERENCE COMPONENT STYLE */
            <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col gap-6">
                {/* Header with Title and Pencil Edit Icon */}
                <div className="flex items-center justify-between pb-3 border-b border-border/40">
                  <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    Personal information
                  </h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(true)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    title="Edit personal information"
                  >
                    <Pencil size={16} />
                  </button>
                </div>

                {/* 2-Column Key-Value Information Grid (Matches Reference Image Exactly) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 sm:gap-x-12">
                  {/* Row 1 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Full name</span>
                    <span className="text-sm font-semibold text-foreground capitalize">
                      {name || user.name || "Jane Doe"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Phone number</span>
                    <span className="text-sm font-semibold text-foreground font-mono">
                      {phoneNumber || user.phoneNumber || "09155019554"}
                    </span>
                  </div>

                  {/* Row 2 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Identity document</span>
                    <span className="text-sm font-semibold text-foreground font-mono">
                      {employeeId || user.employeeId || "a-123-324"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Location</span>
                    <span className="text-sm font-semibold text-foreground">
                      {user.location || "Philippines"}
                    </span>
                  </div>

                  {/* Row 3 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Assigned role</span>
                    <span className="text-sm font-semibold text-foreground capitalize">
                      {user.role ? String(user.role).toLowerCase() : "Teamlead"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Account status</span>
                    <span className="text-sm font-semibold text-foreground">
                      Active
                    </span>
                  </div>

                  {/* Row 4 */}
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Email</span>
                    <span className="text-sm font-semibold text-foreground break-all">
                      {email || user.email || "denniscanaya2023@gmail.com"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-normal text-muted-foreground">Administrative scope</span>
                    <span className="text-sm font-semibold text-foreground">
                      Review Centers &amp; Portals
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            /* EDIT MODE: CLEAN FORM TO UPDATE DATA */
            <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <CardHeader className="border-b border-border pb-4 pt-5 px-5 sm:px-6 bg-card flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Edit personal information
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Update your primary display credentials, email contact, and institutional phone line.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X size={15} className="mr-1" /> Cancel
                </Button>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <User size={12} className="text-primary" /> Full Name <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Jane Doe"
                          className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                          required
                        />
                      </div>
                      <span className="text-[10.5px] text-muted-foreground">
                        Displayed on administrative audit logs and candidate feedback.
                      </span>
                    </div>

                    {/* Employee ID */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <IdCard size={12} className="text-indigo-500" /> Identity Document (Employee ID)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={employeeId}
                          onChange={(e) => setEmployeeId(e.target.value)}
                          placeholder="e.g. a-123-324"
                          className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium font-mono"
                        />
                      </div>
                      <span className="text-[10.5px] text-muted-foreground">
                        Assigned institutional badge identifier.
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Email Address */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Mail size={12} className="text-primary" /> Email Address <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@university.edu"
                          className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                          required
                        />
                      </div>
                      <span className="text-[10.5px] text-muted-foreground font-medium">
                        Used for portal sign-in, password reset, and security notifications.
                      </span>
                    </div>

                    {/* Phone Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Phone size={12} className="text-primary" /> Phone Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="e.g. +63 917 123 4567"
                          className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium font-mono"
                        />
                      </div>
                      <span className="text-[10.5px] text-muted-foreground">
                        Emergency mobile line for institutional critical alerts.
                      </span>
                    </div>
                  </div>

                  {/* Submission Row */}
                  <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-border mt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelEdit}
                      className="h-10 px-4 rounded-xl text-xs font-bold border-border cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Save size={14} />
                      {isSavingProfile ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 5. Tab 2: SECURITY & PASSWORD */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start animate-in fade-in duration-200">
          {/* LEFT COLUMN (Col span 8): Password Form */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
              <CardHeader className="border-b border-border pb-4 pt-5 px-5 sm:px-6 bg-card">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Lock size={15} />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground">
                      Update Account Password
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ensure your internal administrative account is protected with a strong, distinct password.
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6">
                <form onSubmit={handleUpdatePassword} className="flex flex-col gap-5">
                  {/* Current Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <KeyRound size={12} className="text-primary" /> Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter your existing password"
                        className="w-full h-10 px-3.5 pr-10 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        tabIndex={-1}
                      >
                        {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password & Strength */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Lock size={12} className="text-primary" /> New Password <span className="text-primary">*</span>
                      </label>
                      {newPassword && (
                        <span className={`text-[11px] font-bold ${passwordStrengthLabel.color}`}>
                          {passwordStrengthLabel.text}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters with mixed characters"
                        className="w-full h-10 px-3.5 pr-10 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        tabIndex={-1}
                      >
                        {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Visual Password Strength Bar */}
                    {newPassword && (
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrengthLabel.barColor}`}
                          style={{ width: `${passwordStrength}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-primary" /> Confirm New Password <span className="text-primary">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter your new password to verify"
                        className={`w-full h-10 px-3.5 pr-10 bg-background border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all font-medium ${
                          confirmPassword && confirmPassword !== newPassword
                            ? "border-rose-500 focus:border-rose-500"
                            : "border-border focus:border-primary"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {confirmPassword && confirmPassword !== newPassword && (
                      <span className="text-[10.5px] font-bold text-rose-500 flex items-center gap-1">
                        <AlertCircle size={12} /> Passwords do not match.
                      </span>
                    )}
                  </div>

                  {/* Submit Action */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-border mt-1">
                    <span className="text-[11px] text-muted-foreground">
                      You will remain logged in on this browser after updating.
                    </span>
                    <Button
                      type="submit"
                      disabled={isSavingPassword || (!!confirmPassword && confirmPassword !== newPassword)}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Key size={14} />
                      {isSavingPassword ? "Updating Password..." : "Update Security Password"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (Col span 4): Password Policy Guidelines */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <Card className="bg-card border border-border rounded-2xl p-5 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Shield size={15} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Password Standards
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    BoardQuest Administrative Policy
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Must be at least 6 characters in length (10+ recommended).</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Include upper &amp; lower case letters and numerical digits.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>Never share or store credentials in unencrypted spreadsheets.</span>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded-xl border border-border text-[11px] text-muted-foreground leading-relaxed mt-1">
                Password changes take effect immediately across all active internal review centers and API endpoints.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileSettings;