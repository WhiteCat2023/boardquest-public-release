import { BookOpen, GraduationCap, Users, HelpCircle } from "lucide-react";

export interface KPICardContent {
  id: string;
  title: string;
  count: number;
  subtitle: string;
  icon: any;
  link: string;
}

export const kpiContentForTeachers = (
   teacherAuthoredCount: number,
   handledCategoriesCount: number,
   totalStudents: number,
   totalFaculties: number): KPICardContent[] => [
  {
    id: "questions",
    title: "MY QUESTIONS",
    count: teacherAuthoredCount,
    subtitle: "Authored in draft & review",
    icon: HelpCircle,
    link: "/question-bank/my-questions",
  },
  {
    id: "curriculum",
    title: "HANDLED SUBJECTS",
    count: handledCategoriesCount,
    subtitle: "Assigned subject areas",
    icon: BookOpen,
    link: "/subject-management",
  },
  {
    id: "students",
    title: "ENROLLED STUDENTS",
    count: totalStudents,
    subtitle: "Across all active cohorts",
    icon: GraduationCap,
    link: "/student-management",
  },
  {
    id: "users",
    title: "FACULTY PEERS",
    count: totalFaculties,
    subtitle: "Active teaching staff",
    icon: Users,
    link: "/faculty-management",
  },
];

export const kpiContentForAdmin = (
   totalQuestions: number,
   handledCategoriesCount: number,
   totalStudents: number,
   totalFaculties: number): KPICardContent[] => [
    {
        id: "questions",
        title: "QUESTION BANK",
        count: totalQuestions,
        subtitle: "In question repository",
        icon: HelpCircle,
        link: "/question-bank/shared-library",
      },
      {
        id: "curriculum",
        title: "TOTAL SUBJECTS",
        count: handledCategoriesCount,
        subtitle: "All subject areas",
        icon: BookOpen,
        link: "/subject-management",
      },
      {
        id: "students",
        title: "ENROLLED STUDENTS",
        count: totalStudents,
        subtitle: "Across all active cohorts",
        icon: GraduationCap,
        link: "/student-management",
      },
      {
        id: "users",
        title: "ACTIVE FACULTY",
        count: totalFaculties,
        subtitle: "Active teaching staff",
        icon: Users,
        link: "/faculty-management",
      },
];
    
