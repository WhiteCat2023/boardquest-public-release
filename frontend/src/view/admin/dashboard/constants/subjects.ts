import {
  FlaskConical,
  Dna,
  Droplet,
  Microscope,
  ShieldCheck,
  BookOpenCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const SUBJECT_PRESETS = [
  {
    code: "CC-301",
    keyword: "chemistry",
    icon: FlaskConical,
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    barColor: "bg-emerald-500",
    proficiency: 84,
  },
  {
    code: "MB-302",
    keyword: "microbiol",
    icon: Dna,
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    barColor: "bg-purple-500",
    proficiency: 78,
  },
  {
    code: "HE-303",
    keyword: "hematol",
    icon: Droplet,
    color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    barColor: "bg-red-500",
    proficiency: 88,
  },
  {
    code: "CM-304",
    keyword: "microscop",
    icon: Microscope,
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    barColor: "bg-blue-500",
    proficiency: 72,
  },
  {
    code: "IS-305",
    keyword: "immuno",
    icon: ShieldCheck,
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    barColor: "bg-indigo-500",
    proficiency: 81,
  },
  {
    code: "HP-306",
    keyword: "histopath",
    icon: BookOpenCheck,
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    barColor: "bg-amber-500",
    proficiency: 69,
  },
];

