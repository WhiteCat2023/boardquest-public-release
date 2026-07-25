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
                icon: "GraduationCap",
                subItems: [
                    { title: "Students", path: "/student-management" },
                    { title: "Students Evaluation", path: "/student-management?view=evaluation" }
                ]
            },
            {
                title: "Curriculum",
                path: "/curriculum",
                icon: "BookOpenCheck"
            },
            {
                title: "Subject Management",
                path: "/subject-management",
                icon: "BookMarked"
            },
            {
                title: "Review Center Management",
                path: "/review-center",
                icon: "BookOpen"
            },
            {
                title: "Calendar Management",
                path: "/calendar-management",
                icon: "Calendar"
            },
            {
                title: "Question Bank",
                path: "/question-bank",
                icon: "ClipboardList",
                subItems: [
                    { title: "My Questions", path: "/question-bank?view=my-questions" },
                    { title: "Review Questions", path: "/question-bank?view=review" },
                    { title: "Live Questions", path: "/question-bank?view=published" },
                    { title: "Shared Library", path: "/question-bank?view=bank" },
                    { title: "Revisions", path: "/revisions" }
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
