import {
  FlaskConical,
  Dna,
  Droplet,
  Microscope,
  ShieldCheck,
  BookOpenCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MajorSubject {
  code: string;
  name: string;
  icon: LucideIcon;
  color: string;
  barColor: string;
  proficiency: number;
}

export const MAJOR_SUBJECTS: MajorSubject[] = [
  {
    code: "CC-301",
    name: "Clinical Chemistry",
    icon: FlaskConical,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
    proficiency: 84,
  },
  {
    code: "MB-302",
    name: "Microbiology & Parasitology",
    icon: Dna,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    barColor: "bg-purple-500",
    proficiency: 78,
  },
  {
    code: "HE-303",
    name: "Hematology & Coagulation",
    icon: Droplet,
    color: "bg-red-50 text-red-700 border-red-200",
    barColor: "bg-red-500",
    proficiency: 88,
  },
  {
    code: "CM-304",
    name: "Clinical Microscopy",
    icon: Microscope,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    barColor: "bg-blue-500",
    proficiency: 72,
  },
  {
    code: "IS-305",
    name: "Immunology & Blood Bank",
    icon: ShieldCheck,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    barColor: "bg-indigo-500",
    proficiency: 81,
  },
  {
    code: "HP-306",
    name: "Histopath & MT Laws",
    icon: BookOpenCheck,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500",
    proficiency: 69,
  },
];
