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
                title: "Student Management",
                path: "/student-management",
                icon: "GraduationCap"
            },
            {
                title: "Curriculum",
                path: "/curriculum",
                icon: "BookOpenCheck"
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
                    { title: "Live Questions", path: "/question-bank?view=published" },
                    { title: "Shared Library", path: "/question-bank?view=bank" },
                    { title: "Revisions", path: "/question-bank?view=revisions" },
                    { title: "Categories", path: "/question-bank?view=categories" }
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
