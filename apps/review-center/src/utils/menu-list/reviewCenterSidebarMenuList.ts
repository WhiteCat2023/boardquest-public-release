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
    ],
  },
  {
    sideBarCategoryName: "SCHEDULE & TIMELINE",
    content: [
      {
        title: "Evaluation Schedules",
        path: "/schedules",
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
