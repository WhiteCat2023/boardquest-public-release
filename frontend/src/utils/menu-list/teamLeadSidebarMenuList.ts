import type { NavItemProps } from "../../types/sidebarMenuItems";

export const teamLeadNavItem: NavItemProps[] = [
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
                    { title: "Live Questions", path: "/question-bank?view=published" },
                    { title: "Shared Library", path: "/question-bank?view=bank" },
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
]
