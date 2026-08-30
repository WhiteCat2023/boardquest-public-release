import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  BookOpen,
} from "lucide-react";

export interface NavItem {
  title: string;
  url: string;
  icon: any;
  isActive?: boolean;
}

export const reviewCenterNavItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Enrolled Candidates",
    url: "/candidates",
    icon: Users,
  },
  {
    title: "Review Programs",
    url: "/programs",
    icon: BookOpen,
  },
  {
    title: "Evaluation Schedules",
    url: "/schedules",
    icon: Calendar,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];
