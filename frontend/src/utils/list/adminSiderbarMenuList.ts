export interface NavItemProps {
    sideBarCategoryName: string;
    content: NavContentProps[];
}

export interface NavContentProps {
    title: string;
    path: string;
    icon: string;
}

export const navItem: NavItemProps[] = [
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
                    title:"Faculty Management",
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
                    icon: "ClipboardList"
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
                    title: "System Settings",
                    path: "/settings",
                    icon: "Settings"
                },
                {
                    title: "Profile Settings",
                    path: "/profile-settings",   
                    icon: "UserCircle"
                },
            ]
        },
    ]
