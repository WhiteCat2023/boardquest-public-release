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
    sideBarCategoryName: "User Management",
    content: [
      {
        title: "Users",
        path: "/faculty-management",
        icon: "Users",
      },
    ]
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
        title: "Student",
        path: "/student-management",
        icon: "GraduationCap",
      },
      {
        title: "Game Management",
        path: "/game-management",
        icon: "Gamepad2",
      },
      {
        title: "Leaderboards",
        path: "/leaderboards",
        icon: "Trophy",
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
