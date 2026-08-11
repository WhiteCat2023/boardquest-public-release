import type { NavItemProps } from '../../types/sidebarMenuItems';

export const settingsNavItem: NavItemProps[] = [
    {
        sideBarCategoryName: "SETTINGS",
        content: [
            {
                title: "System Settings",
                path: "/settings",
                icon: "Settings"
            },
        ]
    },
];

export default settingsNavItem