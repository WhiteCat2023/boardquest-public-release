import {
  FlaskConical,
  Dna,
  Droplet,
  Microscope,
  ShieldCheck,
  BookOpenCheck,
  Brain,
  Stethoscope,
  HeartPulse,
  Pill,
  Atom,
  Syringe,
  Activity,
  FileText,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface IconOption {
  name: string;
  label: string;
  icon: LucideIcon;
}

export const CATEGORY_ICON_LIST: IconOption[] = [
  { name: "FlaskConical", label: "Chemistry", icon: FlaskConical },
  { name: "Dna", label: "Microbiology", icon: Dna },
  { name: "Droplet", label: "Hematology", icon: Droplet },
  { name: "Microscope", label: "Microscopy", icon: Microscope },
  { name: "ShieldCheck", label: "Immunology", icon: ShieldCheck },
  { name: "BookOpenCheck", label: "Laws / Histopath", icon: BookOpenCheck },
  { name: "Brain", label: "Neuroscience", icon: Brain },
  { name: "Stethoscope", label: "Clinical", icon: Stethoscope },
  { name: "HeartPulse", label: "Physiology", icon: HeartPulse },
  { name: "Pill", label: "Pharmacology", icon: Pill },
  { name: "Atom", label: "Biophysics", icon: Atom },
  { name: "Syringe", label: "Immunohematology", icon: Syringe },
  { name: "Activity", label: "Diagnostics", icon: Activity },
  { name: "FileText", label: "Regulations", icon: FileText },
  { name: "GraduationCap", label: "General Science", icon: GraduationCap },
  { name: "BookOpen", label: "Subject Default", icon: BookOpen },
];

const ICON_MAP: Record<string, LucideIcon> = CATEGORY_ICON_LIST.reduce(
  (acc, item) => {
    acc[item.name] = item.icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

export function getCategoryIcon(
  iconName?: string | null,
  categoryName: string = ""
): LucideIcon {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }

  const nameLower = categoryName.toLowerCase();
  if (nameLower.includes("chemistry")) return FlaskConical;
  if (nameLower.includes("microbiol")) return Dna;
  if (nameLower.includes("hematol")) return Droplet;
  if (nameLower.includes("microscop")) return Microscope;
  if (nameLower.includes("immuno")) return ShieldCheck;
  if (nameLower.includes("histopath") || nameLower.includes("law"))
    return BookOpenCheck;

  return BookOpen;
}

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

export function IconPicker({ selectedIcon, onSelectIcon }: IconPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-foreground">
        Select Subject Icon
      </label>
      <div className="grid grid-cols-8 sm:grid-cols-8 gap-1.5 p-2 bg-muted/30 border border-border rounded-xl">
        {CATEGORY_ICON_LIST.map((item) => {
          const IconComp = item.icon;
          const isSelected = selectedIcon === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => onSelectIcon(item.name)}
              title={item.label}
              className={`p-2 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-xs scale-105"
                  : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              <IconComp size={18} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
