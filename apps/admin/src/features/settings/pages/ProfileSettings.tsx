import { useState, useEffect } from "react";
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

  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl || null);

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