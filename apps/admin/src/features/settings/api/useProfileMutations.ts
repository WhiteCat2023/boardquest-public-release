import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { toast } from "sonner";

export interface UpdateProfileParams {
  name: string;
  email: string;
  phoneNumber?: string;
  employeeId?: string;
}

export function useProfileMutations() {
  const { auth, setAuth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const user = (auth as any)?.data?.user || {};

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const updateProfile = async (data: UpdateProfileParams) => {
    if (!data.name.trim() || !data.email.trim()) {
      toast.error("Please fill in all required profile fields.");
      return false;
    }

    setIsSavingProfile(true);
    try {
      const response = await axiosPrivate.put("/auth/profile", {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        employeeId: data.employeeId,
      });

      const updatedUser = response.data?.data?.user || {
        ...user,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        employeeId: data.employeeId,
      };

      setAuth((prev: any) => ({
        ...prev,
        data: {
          ...prev?.data,
          user: updatedUser,
        },
      }));

      toast.success("Profile information updated successfully!");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile settings.");
      return false;
    } finally {
      setIsSavingProfile(false);
    }
  };

  const updatePassword = async (newPassword: string, confirmPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return false;
    }

    setIsSavingPassword(true);
    try {
      await axiosPrivate.put("/auth/profile", {
        password: newPassword,
      });

      toast.success("Security password updated successfully!");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password.");
      return false;
    } finally {
      setIsSavingPassword(false);
    }
  };

  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, JPEG, WebP).");
      return null;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should not exceed 5MB.");
      return null;
    }

    setIsUploadingAvatar(true);

    return new Promise((resolve) => {
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

          toast.success("Profile picture updated successfully!");
          resolve(uploadedUrl);
        } catch (err: any) {
          toast.error(
            err.response?.data?.message ||
              err.message ||
              "Failed to upload profile picture."
          );
          resolve(null);
        } finally {
          setIsUploadingAvatar(false);
        }
      };

      reader.onerror = () => {
        setIsUploadingAvatar(false);
        toast.error("Failed to read image file.");
        resolve(null);
      };

      reader.readAsDataURL(file);
    });
  };

  const removeAvatar = async () => {
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

      toast.success("Profile picture removed successfully.");
      return true;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to remove profile picture."
      );
      return false;
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return {
    user,
    isSavingProfile,
    isSavingPassword,
    isUploadingAvatar,
    updateProfile,
    updatePassword,
    uploadAvatar,
    removeAvatar,
  };
}
