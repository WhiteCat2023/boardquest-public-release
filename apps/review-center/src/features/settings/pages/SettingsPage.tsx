import React, { useState } from "react";
import { User, Lock } from "lucide-react";
import { toast } from "sonner";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  SettingsHeader,
  PersonalDetailsView,
  ProfileEditForm,
  PasswordForm,
  SecurityStandardsCard,
} from "../components";

type ProfileTab = "details" | "security";

export function SettingsPage() {
  const { user, updateProfile } = useReviewCenterAuth();

  const [activeTab, setActiveTab] = useState<ProfileTab>("details");

  // Form states - Profile
  const [name, setName] = useState(user?.name || "");
  const [employeeId, setEmployeeId] = useState(user?.employeeId || "");
  const [phonenumber, setPhonenumber] = useState(user?.phonenumber || "");
  const [location, setLocation] = useState(
    user?.location || user?.reviewCenter?.location || "Philippines"
  );
  const [companyName, setCompanyName] = useState(
    user?.companyName || user?.reviewCenter?.name || ""
  );
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form states - Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

 // Status states
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleStartEdit = () => {
    setName(user?.name || "");
    setEmployeeId(user?.employeeId || "");
    setPhonenumber(user?.phonenumber || "");
    setLocation(user?.location || user?.reviewCenter?.location || "Philippines");
    setCompanyName(user?.companyName || user?.reviewCenter?.name || "");
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setName(user?.name || "");
    setEmployeeId(user?.employeeId || "");
    setPhonenumber(user?.phonenumber || "");
    setLocation(user?.location || user?.reviewCenter?.location || "Philippines");
    setCompanyName(user?.companyName || user?.reviewCenter?.name || "");
    setIsEditingProfile(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please fill in your representative name.");
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        employeeId: employeeId.trim(),
        phonenumber: phonenumber.trim(),
        location: location.trim(),
        companyName: companyName.trim(),
      });

      toast.success("Profile information updated successfully!");
      setIsEditingProfile(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to update profile settings.";
      toast.error(message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
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
      await updateProfile({
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Security password updated successfully!");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update password.";
      toast.error(message);
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans bg-background text-foreground pb-12">
      {/* 1. Profile Header */}
      <SettingsHeader
        name={user?.name || name}
        email={user?.email}
        companyName={user?.companyName || user?.reviewCenter?.name || companyName}
        location={user?.location || user?.reviewCenter?.location || location}
      />

      {/* 2. Navigation Tabs & Content */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as ProfileTab)}
        className="gap-4"
      >
        <div className="border-b border-border flex items-center overflow-x-auto scrollbar-none pt-1">
          <TabsList className="bg-transparent h-auto p-0 gap-1 sm:gap-2 rounded-none border-b-0">
            <TabsTrigger
              value="details"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold rounded-none border-b-2 -mb-[1px] border-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all cursor-pointer shrink-0"
            >
              <User
                size={14}
                className={activeTab === "details" ? "text-primary" : "text-muted-foreground"}
              />
              <span>Personal Details</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold rounded-none border-b-2 -mb-[1px] border-transparent text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-all cursor-pointer shrink-0"
            >
              <Lock
                size={14}
                className={activeTab === "security" ? "text-primary" : "text-muted-foreground"}
              />
              <span>Security &amp; Password</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Personal Details */}
        <TabsContent value="details" className="mt-0 outline-hidden">
          {isEditingProfile ? (
            <ProfileEditForm
              name={name}
              employeeId={employeeId}
              phonenumber={phonenumber}
              location={location}
              companyName={companyName}
              email={user?.email}
              isSaving={isSavingProfile}
              onNameChange={setName}
              onEmployeeIdChange={setEmployeeId}
              onPhonenumberChange={setPhonenumber}
              onLocationChange={setLocation}
              onCompanyNameChange={setCompanyName}
              onCancel={handleCancelEdit}
              onSubmit={handleUpdateProfile}
            />
          ) : (
            <PersonalDetailsView
              name={user?.name || name}
              phonenumber={user?.phonenumber || phonenumber}
              employeeId={user?.employeeId || employeeId}
              location={user?.location || user?.reviewCenter?.location || location}
              email={user?.email}
              companyName={user?.companyName || user?.reviewCenter?.name || companyName}
              onEdit={handleStartEdit}
            />
          )}
        </TabsContent>

        {/* Tab 2: Security & Password */}
        <TabsContent value="security" className="mt-0 outline-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start animate-in fade-in duration-200">
            <div className="xl:col-span-8 flex flex-col gap-4">
              <PasswordForm
                currentPassword={currentPassword}
                newPassword={newPassword}
                confirmPassword={confirmPassword}
                isSaving={isSavingPassword}
                onCurrentPasswordChange={setCurrentPassword}
                onNewPasswordChange={setNewPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onSubmit={handleUpdatePassword}
              />
            </div>
            <div className="xl:col-span-4 flex flex-col gap-4">
              <SecurityStandardsCard />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SettingsPage;
