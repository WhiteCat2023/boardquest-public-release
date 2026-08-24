import type { NavItemProps } from "../../types/sidebarMenuItems";

export const superAdminNavItem: NavItemProps[] = [
    {
        sideBarCategoryName: "OVERVIEW",
        content: [
            {
                title: "Dashboard",
                path: "/",
                icon: "LayoutDashboard"
            },
        ]
    },
    {
        sideBarCategoryName: "USER MANAGEMENT",
        content: [
            {
                title: "Users",
                path: "/faculty-management",
                icon: "Users"
            },
        ]
    },
    {
        sideBarCategoryName: "SYSTEM & USER",
        content: [
            {
                title: "Logs Management",
                path: "/logs-management",
                icon: "ScrollText"
            },
            {
                title: "System Settings",
                path: "/settings",
                icon: "Settings"
            },
        ]
    },
];
