import type { NavItemProps } from "../../types/sidebarMenuItems";

export const teacherNavItem: NavItemProps[] = [
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
        sideBarCategoryName: "LEARNING MANAGEMENT",
        content: [
            {
                title: "Question Bank",
                path: "/question-bank",
                icon: "ClipboardList"
            },
        ]
    },
    {
        sideBarCategoryName: "SYSTEM & USER",
        content: [
            {
                title: "Profile Settings",
                path: "/profile-settings",   
                icon: "UserCircle"
            },
        ]
    },
]
