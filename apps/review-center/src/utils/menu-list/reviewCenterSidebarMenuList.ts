import type { NavItemProps, NavContentProps } from "../../types/sidebarMenuItems";

export const reviewCenterNavItem: NavItemProps[] = [
  {
    sideBarCategoryName: "OVERVIEW",
    content: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    sideBarCategoryName: "STUDENT MANAGEMENT",
    content: [
      {
        title: "Enrolled Students",
        path: "/candidates",
        icon: "Users",
      },
      {
        title: "Scores & Grades",
        path: "/scores",
        icon: "Award",
      },
    ],
  },
  {
    sideBarCategoryName: "SCHEDULE & TIMELINE",
    content: [
      {
        title: "Calendar",
        path: "/calendar",
        icon: "Calendar",
      },
    ],
  },
  {
    sideBarCategoryName: "SYSTEM & PREFERENCES",
    content: [
      {
        title: "Settings",
        path: "/settings",
        icon: "Settings",
      },
    ],
  },
];

// Compatibility exports
export type NavItem = NavContentProps;
export const reviewCenterNavItems = reviewCenterNavItem;
export default reviewCenterNavItem;
