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
                title: "Subject Management",
                path: "/subject-management",
                icon: "BookMarked"
            },
            {
                title: "Question Bank",
                path: "/question-bank",
                icon: "ClipboardList",
                subItems: [
                    { title: "My Questions", path: "/question-bank/my-questions" },
                    { title: "Review Questions", path: "/question-bank/review-questions" },
                    { title: "Shared Library", path: "/question-bank/shared-library" },
                    { title: "Revisions", path: "/question-bank/revisions" }
                ]
            },
        ]
    },
]
