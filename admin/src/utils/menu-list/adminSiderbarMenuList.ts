import type { NavItemProps } from "../../types/sidebarMenuItems";

export const adminNavItem: NavItemProps[] = [
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
    sideBarCategoryName: "USER MANAGEMENT",
    content: [
      {
        title: "Users",
        path: "/faculty-management",
        icon: "Users",
      },
    ],
  },
  {
    sideBarCategoryName: "LEARNING MANAGEMENT",
    content: [
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
        title: "Students",
        path: "/student-management",
        icon: "GraduationCap",
      },
      {
        title: "Analytics",
        path: "/analytics",
        icon: "BarChart2",
      },
    ],
  },
  {
    sideBarCategoryName: "SYSTEM & USER",
    content: [
      {
        title: "Logs Management",
        path: "/logs-management",
        icon: "ScrollText",
      },
      {
        title: "System Settings",
        path: "/settings",
        icon: "Settings",
      },
    ],
  },
];
