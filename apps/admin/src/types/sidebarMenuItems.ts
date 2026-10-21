export interface NavItemProps {
    sideBarCategoryName: string;
    content: NavContentProps[];
}

export interface NavContentProps {
    title: string;
    path: string;
    icon: string;
    badge?: number | string;
    subItems?: {
        title: string;
        path: string;
    }[];
}
