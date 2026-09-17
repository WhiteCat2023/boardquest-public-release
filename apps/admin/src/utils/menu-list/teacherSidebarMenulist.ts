import type { NavItemProps } from "../../types/sidebarMenuItems";

export const teacherNavItem: NavItemProps[] = [
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
        title: "Subject",
        path: "/subject-management",
        icon: "BookMarked",
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
        title: "All Questions",
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
    ],
  },
  {
    sideBarCategoryName: "SYSTEM & USER",
    content: [
      {
        title: "System Settings",
        path: "/settings",
        icon: "Settings",
      },
    ],
  },
];
