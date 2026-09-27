import { useState, useEffect } from "react";
import type { RankTier } from "../../types/types";
import { calculateMinXp } from "./rankEditorConstants";

interface UseRankEditorFormProps {
  isOpen: boolean;
  rank?: RankTier | null;
  onSave: (rankData: Partial<RankTier>) => Promise<void> | void;
}

export function useRankEditorForm({
  isOpen,
  rank,
  onSave,
}: UseRankEditorFormProps) {
  const isEditing = Boolean(rank && rank.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [minLevel, setMinLevel] = useState<number>(1);
  const [maxLevel, setMaxLevel] = useState<number | null>(9);
  const [isUncapped, setIsUncapped] = useState<boolean>(false);
  const [icon, setIcon] = useState<string>("Award");
  const [color, setColor] = useState<string>("#3B82F6");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Sync state with rank prop
  useEffect(() => {
    if (rank) {
      setTitle(rank.title || "");
      setDescription(rank.description || "");
      setMinLevel(rank.minLevel ?? 1);
      setMaxLevel(rank.maxLevel ?? null);
      setIsUncapped(rank.maxLevel === null || rank.maxLevel === undefined);
      setIcon(rank.icon || "Award");
      setColor(rank.color || "#3B82F6");
      setIsActive(rank.isActive ?? true);
    } else {
      // Default for new tier
      setTitle("");
      setDescription("");
      setMinLevel(1);
      setMaxLevel(9);
      setIsUncapped(false);
      setIcon("Award");
      setColor("#3B82F6");
      setIsActive(true);
    }
  }, [rank, isOpen]);

  // Handle Uncapped Level checkbox
  const handleToggleUncapped = (checked: boolean) => {
    setIsUncapped(checked);
    if (checked) {
      setMaxLevel(null);
    } else {
      setMaxLevel(minLevel + 9);
    }
  };

  const calculatedMinXp = calculateMinXp(minLevel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await onSave({
      ...(rank ? { id: rank.id } : {}),
      title: title.trim(),
      name: title.trim(),
      description: description.trim(),
      minLevel: Number(minLevel),
      maxLevel: isUncapped ? null : maxLevel !== null ? Number(maxLevel) : null,
      minXp: calculatedMinXp,
      icon,
      color,
      isActive,
    });
  };

  return {
    isEditing,
    title,
    setTitle,
    description,
    setDescription,
    minLevel,
    setMinLevel,
    maxLevel,
    setMaxLevel,
    isUncapped,
    handleToggleUncapped,
    icon,
    setIcon,
    color,
    setColor,
    isActive,
    setIsActive,
    calculatedMinXp,
    handleSubmit,
  };
}
