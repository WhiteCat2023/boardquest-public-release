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
    // {
    //     sideBarCategoryName: "LEARNING MANAGEMENT",
    //     content: [
    //         {
    //             title: "Subject Management",
    //             path: "/subject-management",
    //             icon: "BookMarked"
    //         },
    //         {
    //             title: "Review Center Management",
    //             path: "/review-center",
    //             icon: "BookOpen"
    //         },
    //         {
    //             title: "Calendar Management",
    //             path: "/calendar-management",
    //             icon: "Calendar"
    //         },
    //         {
    //             title: "Question Bank",
    //             path: "/question-bank",
    //             icon: "ClipboardList",
    //             subItems: [
    //                 { title: "My Questions", path: "/question-bank/my-questions" },
    //                 { title: "Review Questions", path: "/question-bank/review-questions" },
    //                 { title: "Shared Library", path: "/question-bank/shared-library" },
    //                 { title: "Revisions", path: "/question-bank/revisions" }
    //             ]
    //         },
    //     ]
    // },
    // {
    //     sideBarCategoryName: "STUDENT MANAGEMENT",
    //     content: [
    //         {
    //             title: "Students",
    //             path: "/student-management",
    //             icon: "GraduationCap"
    //         },
    //         {
    //             title: "Analytics",
    //             path: "/analytics",
    //             icon: "BarChart2"
    //         },
    //     ]
    // },
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
]
