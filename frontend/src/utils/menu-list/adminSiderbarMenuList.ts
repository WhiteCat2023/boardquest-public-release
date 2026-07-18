import type { NavItemProps } from "../../types/sidebarMenuItems";

export const adminNavItem: NavItemProps[] = [
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
                title: "Faculty Management",
                path: "/faculty-management",
                icon: "Users"
            },
            {
                title: "Review Center",
                path: "/review-center",
                icon: "BookOpen"
            },
            {
                title: "Question Bank",
                path: "/question-bank",
                icon: "ClipboardList",
                subItems: [
                    { title: "My Questions", path: "/question-bank?view=my-questions" },
                    { title: "Published", path: "/question-bank?view=published" },
                    { title: "Bank", path: "/question-bank?view=bank" },
                    { title: "Revisions", path: "/question-bank?view=revisions" }
                ]
            },
        ]
    },
    {
        sideBarCategoryName: "STUDENT MANAGEMENT",
        content: [
            {
                title: "Analytics",
                path: "/analytics",
                icon: "BarChart2"
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
            {
                title: "System Settings",
                path: "/settings",
                icon: "Settings"
            },
        ]
    },
]
