export const MEDTECH_SUBJECTS = [
  "Clinical Chemistry",
  "Microbiology & Parasitology",
  "Hematology",
  "Immunology & Serology and Immunohematology",
  "Clinical Microscopy & Parasitology",
  "Histopathology and Medtech Laws",
] as const;

export type MedTechSubject = (typeof MEDTECH_SUBJECTS)[number];

export const MEDTECH_SUBJECT_WEIGHTS: Record<MedTechSubject, number> = {
  "Clinical Chemistry": 0.20,
  "Microbiology & Parasitology": 0.20,
  "Hematology": 0.20,
  "Immunology & Serology and Immunohematology": 0.20,
  "Clinical Microscopy & Parasitology": 0.10,
  "Histopathology and Medtech Laws": 0.10,
};

export interface MedTechSubjectDetail {
  name: MedTechSubject;
  slug: string;
  weightPercent: number;
  description: string;
  code: string;
  themeColor: string;
}

export const MEDTECH_SUBJECT_DETAILS: MedTechSubjectDetail[] = [
  {
    name: "Clinical Chemistry",
    slug: "clinical-chemistry",
    weightPercent: 20,
    description: "Analytic methods, toxicology, organ function panels & clinical enzymology.",
    code: "CC",
    themeColor: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200 dark:border-blue-800",
  },
  {
    name: "Microbiology & Parasitology",
    slug: "microbiology-parasitology",
    weightPercent: 20,
    description: "Bacteriology, virology, mycology, parasitology & antimicrobial susceptibility.",
    code: "MICRO",
    themeColor: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800",
  },
  {
    name: "Hematology",
    slug: "hematology",
    weightPercent: 20,
    description: "RBC & WBC morphology, coagulopathies, hemostasis, automated counters & bone marrow.",
    code: "HEMA",
    themeColor: "from-rose-500/10 to-red-500/10 text-rose-600 border-rose-200 dark:border-rose-800",
  },
  {
    name: "Immunology & Serology and Immunohematology",
    slug: "immunology-serology",
    weightPercent: 20,
    description: "Serological assays, blood banking, ABO/Rh typing, compatibility testing & immunology.",
    code: "IS-IH",
    themeColor: "from-violet-500/10 to-purple-500/10 text-violet-600 border-violet-200 dark:border-violet-800",
  },
  {
    name: "Clinical Microscopy & Parasitology",
    slug: "clinical-microscopy",
    weightPercent: 10,
    description: "Urinalysis, body fluids analysis, stool examination & microscopic sediments.",
    code: "CM",
    themeColor: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200 dark:border-amber-800",
  },
  {
    name: "Histopathology and Medtech Laws",
    slug: "histopathology-medtech-laws",
    weightPercent: 10,
    description: "Tissue processing, staining techniques, Bioethics, RA 5527 & MedTech board jurisprudence.",
    code: "HISTO-LAW",
    themeColor: "from-cyan-500/10 to-sky-500/10 text-cyan-600 border-cyan-200 dark:border-cyan-800",
  },
];

export function getSubjectBySlug(slug?: string): MedTechSubjectDetail | undefined {
  if (!slug) return undefined;
  return MEDTECH_SUBJECT_DETAILS.find(
    (s) => s.slug === slug || s.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === slug
  );
}

export interface ScoreRecord {
  id: string;
  assessmentId: string;
  candidateId: string;
  candidate?: {
    id: string;
    name: string;
    email: string;
    schoolId?: string;
    status: string;
  };
  score: number | null;
  percentage: number | null;
  percentile: number | null;
  status: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE";
  emailStatus: "NOT_SENT" | "PENDING" | "SENT" | "FAILED";
  emailSentAt?: string | null;
  remarks?: string | null;
  recordedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Assessment {
  id: string;
  companyName: string;
  reviewCenterId?: string | null;
  title: string;
  customLabel?: string | null;
  subject: string;
  schoolYear: string;
  maxScore: number;
  passingScore: number;
  passingRate: number;
  assessmentDate?: string | null;
  isPublished: boolean;
  meanScore?: number | null;
  medianScore?: number | null;
  modeScore?: number[];
  highestScore?: number | null;
  lowestScore?: number | null;
  passCount: number;
  failCount: number;
  scores?: ScoreRecord[];
  _count?: {
    scores: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentFilters {
  schoolYear?: string;
  subject?: string;
  search?: string;
}

export interface CreateAssessmentPayload {
  title: string;
  customLabel?: string;
  subject: string;
  schoolYear: string;
  maxScore: number;
  passingRate?: number;
  assessmentDate?: string;
  isPublished?: boolean;
}

export interface ScoreInputItem {
  candidateId?: string;
  schoolId?: string;
  email?: string;
  name?: string;
  score?: number | null;
  status?: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE";
  remarks?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  createdCount: number;
  updatedCount: number;
  errors: string[];
  stats?: any;
}

export interface GradeMatrixRow {
  candidate: {
    id: string;
    name: string;
    email: string;
    schoolId?: string;
    status: string;
  };
  scores: Record<
    string,
    {
      id: string | null;
      score: number | null;
      percentage: number | null;
      percentile: number | null;
      status: "PRESENT" | "ABSENT" | "EXCUSED" | "INCOMPLETE";
      remarks: string | null;
      emailStatus: string;
    }
  >;
  summary: {
    totalPoints: number;
    maxPossiblePoints: number;
    assessmentsTaken: number;
    overallPercentage: number | null;
    isPassing: boolean;
  };
}

export interface GradeMatrixResponse {
  assessments: {
    id: string;
    title: string;
    customLabel?: string | null;
    subject: string;
    maxScore: number;
    passingRate: number;
    passingScore: number;
    meanScore?: number | null;
    medianScore?: number | null;
    modeScore?: number[];
    passCount: number;
    failCount: number;
  }[];
  candidatesCount: number;
  rows: GradeMatrixRow[];
}

export interface CandidateScoreTranscript {
  candidate: {
    id: string;
    name: string;
    email: string;
    schoolId?: string;
    schoolYear: string;
    status: string;
  };
  subjectAverages: {
    subject: string;
    averagePercentage: number | null;
    assessmentsCount: number;
    scores: ScoreRecord[];
  }[];
  boardExamSimulation: {
    gwa: number;
    passed: boolean;
    conditionFailed: boolean;
    failedSubjects: string[];
  };
}
