import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useProfileMutations } from "../api";
import {
  ProfileHeader,
  ProfileNavTabs,
  type ProfileTab,
  PersonalDetailsTab,
  SecurityPasswordTab,
} from "../components/profile";

export function ProfileSettings() {
  const {
    user,
    isSavingProfile,
    isSavingPassword,
    isUploadingAvatar,
    updateProfile,
    updatePassword,
    uploadAvatar,
    removeAvatar,
  } = useProfileMutations();

  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab") as ProfileTab | null;
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    queryTab === "security" ? "security" : "details"
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);

  useEffect(() => {
    if (queryTab === "security" || queryTab === "details") {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  useEffect(() => {
    if (user.avatarUrl !== undefined) {
      setAvatarUrl(user.avatarUrl || null);
    }
  }, [user.avatarUrl]);

  const initials = (user.name || "AD").slice(0, 2).toUpperCase();

  const handleUploadAvatar = async (file: File) => {
    const uploadedUrl = await uploadAvatar(file);
    if (uploadedUrl) {
      setAvatarUrl(uploadedUrl);
    }
  };

  const handleRemoveAvatar = async () => {
    const success = await removeAvatar();
    if (success) {
      setAvatarUrl(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 md:p-6 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans bg-background text-foreground pb-20">
      {/* First-login Security Encouragement Banner */}
      {user?.mustChangePassword && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-800 dark:text-amber-300 text-xs shadow-xs animate-in fade-in duration-200">
          <ShieldAlert className="size-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="space-y-0.5">
            <p className="font-bold text-sm">Security Action Required: Set Your Permanent Password</p>
            <p className="text-xs text-muted-foreground">
              You are currently logged in with a temporary password. For institutional compliance and to safeguard confidential question-bank and student data, please update your password below.
            </p>
          </div>
        </div>
      )}

      {/* 1. Header with Avatar, Name, Role & Status Badges */}
      <ProfileHeader
        name={user.name}
        email={user.email}
        avatarUrl={avatarUrl}
        initials={initials}
        isUploadingAvatar={isUploadingAvatar}
        onUploadAvatar={handleUploadAvatar}
        onRemoveAvatar={handleRemoveAvatar}
      />

      {/* 2. Navigation Tabs Bar */}
      <ProfileNavTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 3. Tab 1: Personal Details */}
      {activeTab === "details" && (
        <PersonalDetailsTab
          user={user}
          isSaving={isSavingProfile}
          onUpdateProfile={updateProfile}
        />
      )}

      {/* 4. Tab 2: Security & Password */}
      {activeTab === "security" && (
        <SecurityPasswordTab
          isSaving={isSavingPassword}
          onUpdatePassword={updatePassword}
        />
      )}
    </div>
  );
}

export default ProfileSettings;