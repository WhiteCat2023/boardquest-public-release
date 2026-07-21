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
                icon: "ClipboardList",
                subItems: [
                    { title: "My Questions", path: "/question-bank?view=my-questions" },
                    { title: "Live Questions", path: "/question-bank?view=published" },
                    { title: "Shared Library", path: "/question-bank?view=bank" },
                    { title: "Revisions", path: "/question-bank?view=revisions" },
                    { title: "Categories", path: "/question-bank?view=categories" }
                ]
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
