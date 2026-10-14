import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { GameBadge, BadgeType } from "../../types/types";
import { uploadBadgeImage } from "../../services/badgeUploadService";
import {
  BADGE_TYPES,
  type BoardQuesterPreset,
} from "./badgeEditorConstants";

interface UseBadgeEditorFormParams {
  badge?: GameBadge | null;
  isOpen: boolean;
  onSave: (badgeData: GameBadge) => void;
}

export function useBadgeEditorForm({
  badge,
  isOpen,
  onSave,
}: UseBadgeEditorFormParams) {
  const [formData, setFormData] = useState<Partial<GameBadge>>({
    title: "",
    badgeType: "bronze",
    category: "QUEST",
    description: "",
    xp: 100,
    iconName: "Medal",
    imageUrl: "",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    glowColor: "shadow-amber-500/10",
    isActive: true,
    triggerRule: { type: "accuracy", threshold: 80 },
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCloudUploaded, setIsCloudUploaded] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    if (badge) {
      setFormData(badge);
      const existingImg = badge.imageUrl || badge.spriteUrl || "";
      setImagePreviewUrl(existingImg);
      setSelectedFile(null);
      setIsCloudUploaded(Boolean(existingImg));
    } else {
      const defaultTier = BADGE_TYPES[0];
      setFormData({
        id: `badge_${Date.now()}`,
        title: "",
        badgeType: defaultTier.type,
        category: "QUEST",
        description: "",
        xp: 100,
        iconName: "Medal",
        imageUrl: "",
        color: defaultTier.color,
        bgColor: defaultTier.bgColor,
        borderColor: defaultTier.borderColor,
        glowColor: defaultTier.glowColor,
        isActive: true,
        triggerRule: { type: "accuracy", threshold: 80 },
      });
      setImagePreviewUrl("");
      setSelectedFile(null);
      setIsCloudUploaded(false);
    }
  }, [badge, isOpen]);

  const handleTypeChange = (type: BadgeType) => {
    const matched = BADGE_TYPES.find((b) => b.type === type);
    setFormData((prev) => ({
      ...prev,
      badgeType: type,
      color: matched?.color || prev.color,
      bgColor: matched?.bgColor || prev.bgColor,
      borderColor: matched?.borderColor || prev.borderColor,
      glowColor: matched?.glowColor || prev.glowColor,
    }));
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP, SVG, GIF)");
      return;
    }

    const maxFileSizeMb = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 10;
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      toast.error(`Image size exceeds ${maxFileSizeMb}MB limit`);
      return;
    }

    // Revoke previous blob URL if any
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    // Local instant preview (do not upload yet)
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;

    setSelectedFile(file);
    setImagePreviewUrl(localUrl);
    setIsCloudUploaded(false);
    setFormData((prev) => ({ ...prev, imageUrl: localUrl }));
    toast.info("Image loaded for preview. It will be uploaded to cloud when you save.");
  };

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setImagePreviewUrl("");
    setSelectedFile(null);
    setIsCloudUploaded(false);
    setFormData((prev) => ({ ...prev, imageUrl: "", spriteUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    toast.info("Image removed. Fallback icon will be used.");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleApplyPreset = (preset: BoardQuesterPreset) => {
    const matchedTier =
      BADGE_TYPES.find((b) => b.type === preset.badgeType) || BADGE_TYPES[0];
    setFormData((prev) => ({
      ...prev,
      badgeId: preset.badgeId,
      title: preset.title,
      name: preset.name,
      category: preset.category,
      description: preset.description,
      unlockCondition: preset.unlockCondition,
      badgeType: preset.badgeType,
      tier: preset.tier,
      iconName: preset.iconName,
      icon: preset.iconName.toLowerCase(),
      imageUrl: preset.spriteUrl,
      spriteUrl: preset.spriteUrl,
      color: preset.color,
      bgColor: matchedTier.bgColor,
      borderColor: matchedTier.borderColor,
      glowColor: matchedTier.glowColor,
      xp: preset.xpReward,
      xpReward: preset.xpReward,
    }));
    setImagePreviewUrl(preset.spriteUrl || "");
    setIsCloudUploaded(Boolean(preset.spriteUrl));
    setSelectedFile(null);
    toast.success(`Loaded '${preset.name}' preset!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.description?.trim()) {
      toast.error("Please fill in badge title and description.");
      return;
    }

    let finalImageUrl =
      formData.imageUrl?.trim() || formData.spriteUrl?.trim() || "";

    // If there is a local file pending upload, upload it to cloud before saving
    if (selectedFile && !isCloudUploaded) {
      setUploadingImage(true);
      try {
        const sanitizedName = formData.title
          ? formData.title.trim().replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase()
          : `badge_${Date.now()}`;

        finalImageUrl = await uploadBadgeImage(selectedFile, sanitizedName);

        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }

        setImagePreviewUrl(finalImageUrl);
        setSelectedFile(null);
        setIsCloudUploaded(true);
        setFormData((prev) => ({
          ...prev,
          imageUrl: finalImageUrl,
          spriteUrl: finalImageUrl,
        }));
        toast.success("Badge image uploaded to Supabase Cloud Storage!");
      } catch (err: any) {
        console.error("Storage upload before save failed:", err);
        toast.error(
          err?.response?.data?.message ||
            "Failed to upload image to Cloud Storage before saving. Please try again."
        );
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }

    const currentTier =
      BADGE_TYPES.find((t) => t.type === formData.badgeType) || BADGE_TYPES[0];

    const cleanSlug = (formData.badgeId || formData.title || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    onSave({
      id: formData.id || "",
      badgeId: cleanSlug,
      title: formData.title.trim(),
      name: formData.name?.trim() || formData.title.trim(),
      category: formData.category || "QUEST",
      tier: formData.tier || currentTier.type.toUpperCase(),
      description: formData.description.trim(),
      icon: (formData.iconName || formData.icon || "trophy").toLowerCase(),
      spriteUrl: finalImageUrl || null,
      color: formData.color || currentTier.color,
      unlockCondition:
        formData.unlockCondition?.trim() || `Complete ${formData.title.trim()}`,
      xpReward: Number(formData.xpReward) || Number(formData.xp) || 50,
      confidenceFactor: Number(formData.confidenceFactor) || 1.0,
      isActive: formData.isActive ?? true,
      badgeType: formData.badgeType || "bronze",
      xp: Number(formData.xpReward) || Number(formData.xp) || 50,
      iconName: formData.iconName || formData.icon || "Medal",
      imageUrl: finalImageUrl || undefined,
      bgColor: currentTier.bgColor,
      borderColor: currentTier.borderColor,
      glowColor: currentTier.glowColor,
    });
  };

  return {
    formData,
    setFormData,
    uploadingImage,
    imagePreviewUrl,
    selectedFile,
    isCloudUploaded,
    dragOver,
    setDragOver,
    fileInputRef,
    handleTypeChange,
    handleFileSelect,
    handleRemoveImage,
    handleDrop,
    handleApplyPreset,
    handleSubmit,
  };
}
