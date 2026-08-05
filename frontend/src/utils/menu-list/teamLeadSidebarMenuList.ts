import type { NavItemProps } from "../../types/sidebarMenuItems";

export const teamLeadNavItem: NavItemProps[] = [
  {
    sideBarCategoryName: "OVERVIEW",
    content: [
      {
        title: "Dashboard",
        path: "/",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    sideBarCategoryName: "LEARNING MANAGEMENT",
    content: [
      {
        title: "Faculty ",
        path: "/faculty-management",
        icon: "Users",
      },
      {
        title: "Student",
        path: "/student-management",
        icon: "GraduationCap",
      },
      {
        title: "Subject",
        path: "/subject-management",
        icon: "BookMarked",
      },
      {
        title: "Review Center",
        path: "/review-center",
        icon: "BookOpen",
      },
      {
        title: "Calendar",
        path: "/calendar-management",
        icon: "Calendar",
      },
    ],
  },
  {
    sideBarCategoryName: "QUESTION BANK",
    content: [
      {
        title: "My Questions",
        path: "/question-bank/my-questions",
        icon: "FileText",
      },
      {
        title: "Review Questions",
        path: "/question-bank/review-questions",
        icon: "CheckSquare",
      },
      {
        title: "Shared Library",
        path: "/question-bank/shared-library",
        icon: "Library",
      },
    ],
  },
  {
    sideBarCategoryName: "STUDENT MANAGEMENT",
    content: [
      {
        title: "Analytics",
        path: "/analytics",
        icon: "BarChart2",
      },
    ],
  },
];
