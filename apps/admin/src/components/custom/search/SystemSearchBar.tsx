import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Users,
  GraduationCap,
  BookMarked,
  BookOpen,
  Calendar,
  FileText,
  CheckSquare,
  Library,
  BarChart2,
  Gamepad2,
  Trophy,
  ScrollText,
  Settings,
  User,
  Bell,
  PlusCircle,
  Upload,
  Layers,
  Award,
  ArrowRight,
  CornerDownLeft,
  X,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";

export type SearchCategory = "all" | "component" | "page" | "action";

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category: "component" | "page" | "action";
  pageName: string;
  path: string;
  icon: React.ElementType;
  keywords: string[];
  roles?: string[]; // e.g. ["SUPERADMIN", "DEAN", "TEAMLEAD", "TEACHER"]
}

const SYSTEM_SEARCH_ITEMS: SearchItem[] = [
  // ── PAGE COMPONENTS & SECTIONS ──
  {
    id: "comp-licensure-overview",
    title: "Licensure Examination Subjects Overview",
    description: "Subject performance breakdown, pass rate forecast, and competencies",
    category: "component",
    pageName: "Dashboard",
    path: "/",
    icon: BookMarked,
    keywords: ["licensure", "examination", "subjects", "overview", "board", "competencies", "passing", "dashboard", "table"],
  },
  {
    id: "comp-kpi-cards",
    title: "Performance KPI Cards",
    description: "Key metrics for total students, questions, passing rate, and active cohorts",
    category: "component",
    pageName: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    keywords: ["kpi", "cards", "metrics", "overview", "stats", "passing rate", "quick stats", "dashboard"],
  },
  {
    id: "comp-recent-questions",
    title: "Recent Questions Activity Card",
    description: "Timeline of freshly authored questions and author approval statuses",
    category: "component",
    pageName: "Dashboard",
    path: "/",
    icon: FileText,
    keywords: ["recent", "questions", "activity", "author", "feed", "timeline", "dashboard"],
  },
  {
    id: "comp-passing-analytics",
    title: "Student Passing Rate Analytics",
    description: "Historical trend graphs, score distribution curves, and cohort success rates",
    category: "component",
    pageName: "Dashboard",
    path: "/",
    icon: BarChart2,
    keywords: ["passing rate", "analytics", "trends", "distribution", "score", "dashboard", "charts"],
  },
  {
    id: "comp-performance-graphs",
    title: "Performance Graphs Tab",
    description: "Visual score progression charts, passing milestones, and comparative curves",
    category: "component",
    pageName: "Analytics",
    path: "/analytics",
    icon: BarChart2,
    keywords: ["performance", "graphs", "charts", "visual", "trends", "analytics", "scores"],
  },
  {
    id: "comp-syllabus-readiness",
    title: "Syllabus Readiness Tab",
    description: "Domain readiness scores, topical coverage, and syllabus gap analytics",
    category: "component",
    pageName: "Analytics",
    path: "/analytics",
    icon: BookMarked,
    keywords: ["syllabus", "readiness", "domain", "competency", "coverage", "analytics"],
  },
  {
    id: "comp-student-table",
    title: "Student Directory Table",
    description: "Full student roster with school year, section, progress filters, and search",
    category: "component",
    pageName: "Student Management",
    path: "/student-management",
    icon: GraduationCap,
    keywords: ["student table", "roster", "directory", "students list", "search students", "management"],
  },
  {
    id: "comp-student-progression",
    title: "Student Progression & Level Overview",
    description: "Detailed EXP distribution, tier advancement, and level milestones",
    category: "component",
    pageName: "Student Management",
    path: "/student-management",
    icon: Trophy,
    keywords: ["progression", "level", "exp", "experience", "points", "tier", "students"],
  },
  {
    id: "comp-guidance-desk",
    title: "Guidance & Advising Desk",
    description: "Assign faculty mentors, track at-risk learners, and manage interventions",
    category: "component",
    pageName: "Student Management",
    path: "/student-management",
    icon: Users,
    keywords: ["guidance", "advising", "mentor", "at-risk", "assignment", "intervention"],
  },
  {
    id: "comp-badges-tab",
    title: "Badges Management Tab",
    description: "Achievement badges catalog, unlock requirements, and rarity tiers",
    category: "component",
    pageName: "Game Management",
    path: "/game-management",
    icon: Award,
    keywords: ["badges", "achievements", "rewards", "unlock", "rarity", "game", "gamification"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "comp-ranks-tab",
    title: "Ranks & Levels Management Tab",
    description: "Rank hierarchies, level thresholds, and progression scaling curves",
    category: "component",
    pageName: "Game Management",
    path: "/game-management",
    icon: Gamepad2,
    keywords: ["ranks", "tiers", "leveling", "thresholds", "progression", "game", "gamification"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "comp-my-questions",
    title: "My Questions Desk",
    description: "Personal authoring workbench for drafting and reviewing question submissions",
    category: "component",
    pageName: "Question Bank",
    path: "/question-bank/my-questions",
    icon: FileText,
    keywords: ["my questions", "drafts", "authoring", "submitted", "personal", "question bank"],
  },
  {
    id: "comp-review-questions-desk",
    title: "Review Questions Desk",
    description: "Peer evaluation desk for approving, returning, or publishing new items",
    category: "component",
    pageName: "Question Bank",
    path: "/question-bank/review-questions",
    icon: CheckSquare,
    keywords: ["review questions", "approve", "verify", "quality", "reject", "question bank"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "comp-shared-library",
    title: "All Questions / Shared Library",
    description: "Institutional repository of verified licensure examination test questions",
    category: "component",
    pageName: "Question Bank",
    path: "/question-bank/shared-library",
    icon: Library,
    keywords: ["shared library", "all questions", "repository", "bank", "taxonomy", "search"],
  },
  {
    id: "comp-faculty-roster",
    title: "Faculty Roster & User Table",
    description: "Faculty directory with assigned subjects, role controls, and status",
    category: "component",
    pageName: "Faculty Management",
    path: "/faculty-management",
    icon: Users,
    keywords: ["faculty roster", "teachers", "staff", "users table", "directory"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "comp-audit-logs",
    title: "System Audit Logs Card",
    description: "Comprehensive security, authentication, and action audit trail entries",
    category: "component",
    pageName: "Logs Management",
    path: "/logs-management",
    icon: ScrollText,
    keywords: ["audit logs", "security logs", "events", "history", "timestamp", "activity"],
    roles: ["SUPERADMIN", "DEAN"],
  },
  {
    id: "comp-calendar-timeline",
    title: "Calendar & Review Milestone Timeline",
    description: "Interactive mock exam schedules, review milestones, and academic calendar",
    category: "component",
    pageName: "Calendar Management",
    path: "/calendar-management",
    icon: Calendar,
    keywords: ["calendar", "schedule", "milestones", "mock exams", "timeline", "dates"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },

  // ── PAGES & NAVIGATION ──
  {
    id: "page-dashboard",
    title: "Dashboard Overview",
    description: "Central dashboard with institutional KPIs, pass likelihood, and subjects",
    category: "page",
    pageName: "Overview",
    path: "/",
    icon: LayoutDashboard,
    keywords: ["dashboard", "home", "overview", "main", "portal"],
  },
  {
    id: "page-faculty-management",
    title: "Faculty & User Management",
    description: "Administer faculty accounts, teacher credentials, and portal roles",
    category: "page",
    pageName: "User Management",
    path: "/faculty-management",
    icon: Users,
    keywords: ["faculty", "users", "teachers", "staff", "instructors", "dean", "teamlead"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "page-student-management",
    title: "Student Management",
    description: "Directory of enrolled examinees, academic progress, and cohort records",
    category: "page",
    pageName: "Student Management",
    path: "/student-management",
    icon: GraduationCap,
    keywords: ["students", "student management", "examinees", "learners", "directory"],
  },
  {
    id: "page-subject-management",
    title: "Subject Management",
    description: "Licensure subjects, core competency domains, and syllabus structures",
    category: "page",
    pageName: "Learning Management",
    path: "/subject-management",
    icon: BookMarked,
    keywords: ["subject management", "curriculum", "domains", "courses", "subjects"],
  },
  {
    id: "page-review-center",
    title: "Review Center Management",
    description: "Partner review center profiles, candidates, and coordinator portals",
    category: "page",
    pageName: "Learning Management",
    path: "/review-center",
    icon: BookOpen,
    keywords: ["review center", "partner", "institutes", "external", "coordinators"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "page-calendar-management",
    title: "Calendar Management",
    description: "Exam dates, mock licensure simulations, and review schedules",
    category: "page",
    pageName: "Learning Management",
    path: "/calendar-management",
    icon: Calendar,
    keywords: ["calendar", "schedule", "milestones", "planner", "dates"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "page-question-bank",
    title: "Question Bank & Shared Library",
    description: "Repository of multiple choice licensure questions and peer review desk",
    category: "page",
    pageName: "Question Bank",
    path: "/question-bank/shared-library",
    icon: Library,
    keywords: ["question bank", "library", "test items", "questions", "shared"],
  },
  {
    id: "page-analytics",
    title: "Performance Analytics",
    description: "Institutional readiness metrics, pass rate graphs, and domain mastery",
    category: "page",
    pageName: "Analytics",
    path: "/analytics",
    icon: BarChart2,
    keywords: ["analytics", "performance", "metrics", "graphs", "reports", "insights"],
  },
  {
    id: "page-game-management",
    title: "Game & Gamification Management",
    description: "Configure student levels, badges, EXP values, and gamified mechanics",
    category: "page",
    pageName: "Gamification",
    path: "/game-management",
    icon: Gamepad2,
    keywords: ["game management", "gamification", "badges", "ranks", "levels", "exp"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "page-leaderboards",
    title: "Student Leaderboards",
    description: "Honor roll, highest EXP earners, and top rank standings across cohorts",
    category: "page",
    pageName: "Leaderboards",
    path: "/leaderboards",
    icon: Trophy,
    keywords: ["leaderboards", "rankings", "top students", "standings", "xp podium"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "page-logs-management",
    title: "System Audit Logs",
    description: "Security events, user logins, data alterations, and system diagnostics",
    category: "page",
    pageName: "System",
    path: "/logs-management",
    icon: ScrollText,
    keywords: ["logs", "audit", "security", "activity", "system logs"],
    roles: ["SUPERADMIN", "DEAN"],
  },
  {
    id: "page-settings",
    title: "System Settings",
    description: "Configure institutional branding, term dates, and portal defaults",
    category: "page",
    pageName: "System Settings",
    path: "/system-settings",
    icon: Settings,
    keywords: ["settings", "system settings", "configuration", "preferences"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "page-profile-settings",
    title: "Profile Settings",
    description: "Manage personal account details, change password, and profile avatar",
    category: "page",
    pageName: "Account",
    path: "/profile-settings",
    icon: User,
    keywords: ["profile", "account", "password", "avatar", "my profile", "settings"],
  },
  {
    id: "page-notifications",
    title: "Notifications Center",
    description: "Comprehensive list of notifications, alerts, and unread activity",
    category: "page",
    pageName: "Notifications",
    path: "/notifications",
    icon: Bell,
    keywords: ["notifications", "alerts", "inbox", "updates", "activity feed"],
  },

  // ── QUICK ACTIONS ──
  {
    id: "action-enroll-student",
    title: "Enroll New Student",
    description: "Open the single-student registration and enrollment wizard",
    category: "action",
    pageName: "Student Management",
    path: "/student-management/create",
    icon: PlusCircle,
    keywords: ["enroll student", "add student", "register student", "new student", "create student"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "action-import-students",
    title: "Import Students via CSV",
    description: "Batch upload examinee roster spreadsheet with automatic validation",
    category: "action",
    pageName: "Student Management",
    path: "/student-management/import",
    icon: Upload,
    keywords: ["import students", "upload students", "csv students", "bulk student", "batch student"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "action-create-question",
    title: "Create New Question",
    description: "Launch authoring editor to compose questions, choices, and explanations",
    category: "action",
    pageName: "Question Bank",
    path: "/question-bank/create",
    icon: PlusCircle,
    keywords: ["create question", "new question", "author question", "add question", "write question"],
  },
  {
    id: "action-import-questions",
    title: "Import Questions via CSV",
    description: "Bulk upload multiple question records and taxonomy via CSV template",
    category: "action",
    pageName: "Question Bank",
    path: "/question-bank/import",
    icon: Upload,
    keywords: ["import questions", "upload questions", "csv questions", "bulk questions", "batch questions"],
  },
  {
    id: "action-add-faculty",
    title: "Add Faculty Member",
    description: "Create an instructor or department coordinator account",
    category: "action",
    pageName: "Faculty Management",
    path: "/faculty-management/create",
    icon: PlusCircle,
    keywords: ["add faculty", "create faculty", "new teacher", "add teacher", "create user"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
  {
    id: "action-import-faculty",
    title: "Import Faculty via CSV",
    description: "Bulk provision faculty and teacher accounts from spreadsheet",
    category: "action",
    pageName: "Faculty Management",
    path: "/faculty-management/import",
    icon: Upload,
    keywords: ["import faculty", "csv faculty", "bulk teachers", "batch users"],
    roles: ["SUPERADMIN", "DEAN", "TEAMLEAD"],
  },
];

export function SystemSearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUser = auth?.data?.user || auth?.user;
  const currentUserRole = currentUser?.role?.toUpperCase();

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter items based on query, category, and role permissions
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return SYSTEM_SEARCH_ITEMS.filter((item) => {
      // Role access check (SUPERADMIN has universal access)
      if (
        currentUserRole?.toUpperCase() !== "SUPERADMIN" &&
        item.roles &&
        currentUserRole &&
        !item.roles.includes(currentUserRole)
      ) {
        return false;
      }

      // Category tab filter
      if (activeCategory !== "all" && item.category !== activeCategory) {
        return false;
      }

      // Search query matching
      if (!query) return true;

      const titleMatch = item.title.toLowerCase().includes(query);
      const descMatch = item.description.toLowerCase().includes(query);
      const pageMatch = item.pageName.toLowerCase().includes(query);
      const keywordMatch = item.keywords.some((kw) => kw.toLowerCase().includes(query));

      return titleMatch || descMatch || pageMatch || keywordMatch;
    });
  }, [searchQuery, activeCategory, currentUserRole]);

  // Keep selected item within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, activeCategory]);

  // Handle keyboard navigation within the modal
  const handleDialogKeyDown = (e: React.KeyboardEvent) => {
    if (filteredItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        handleSelectItem(selected);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (!listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  const handleSelectItem = (item: SearchItem) => {
    setIsOpen(false);
    setSearchQuery("");
    navigate(item.path);
  };

  // Category counts
  const counts = useMemo(() => {
    const accessible = SYSTEM_SEARCH_ITEMS.filter(
      (item) => !item.roles || (currentUserRole && item.roles.includes(currentUserRole))
    );
    return {
      all: accessible.length,
      component: accessible.filter((i) => i.category === "component").length,
      page: accessible.filter((i) => i.category === "page").length,
      action: accessible.filter((i) => i.category === "action").length,
    };
  }, [currentUserRole]);

  const getCategoryBadge = (category: SearchItem["category"]) => {
    switch (category) {
      case "component":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Component
          </span>
        );
      case "page":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Page
          </span>
        );
      case "action":
        return (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Action
          </span>
        );
    }
  };

  return (
    <>
      {/* ── Header Trigger Searchbar ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative flex items-center gap-2 h-7.5 sm:h-8 w-36 sm:w-48 md:w-56 lg:w-64 px-2.5 rounded-lg bg-muted/50 hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border/70 hover:border-border transition-all cursor-pointer shadow-2xs font-sans text-xs select-none"
        title="Search components, pages, actions (Ctrl+K)"
      >
        <Search className="size-3.5 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
        <span className="truncate text-left text-[11px] sm:text-xs font-normal">
          <span className="hidden sm:inline">Search components...</span>
          <span className="sm:hidden">Search...</span>
        </span>
        <kbd className="ml-auto pointer-events-none hidden sm:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border/80 bg-background px-1 font-mono text-[9px] font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">
          <span className="text-[10px]">⌘</span>K
        </kbd>
      </button>

      {/* ── Search Modal Dialog ── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="p-0 max-w-xl sm:max-w-2xl gap-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl font-sans"
          onKeyDown={handleDialogKeyDown}
        >
          <DialogTitle className="sr-only">System Component & Page Search</DialogTitle>

          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <Search className="size-4 text-primary shrink-0" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components, pages, sections, actions... (e.g. 'Overview', 'Badges', 'CSV')"
              className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-colors cursor-pointer"
                title="Clear input"
              >
                <X className="size-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted/60 px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/80 bg-muted/30 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Sparkles className="size-3" />
              All
              <span className="text-[10px] opacity-80">({counts.all})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("component")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "component"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <Layers className="size-3" />
              Components
              <span className="text-[10px] opacity-80">({counts.component})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("page")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "page"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <LayoutDashboard className="size-3" />
              Pages
              <span className="text-[10px] opacity-80">({counts.page})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory("action")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeCategory === "action"
                  ? "bg-primary text-primary-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              }`}
            >
              <PlusCircle className="size-3" />
              Quick Actions
              <span className="text-[10px] opacity-80">({counts.action})</span>
            </button>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-border/30 scroll-smooth"
          >
            {filteredItems.length === 0 ? (
              <div className="py-12 px-4 text-center flex flex-col items-center justify-center gap-2">
                <div className="p-3 rounded-2xl bg-muted/60 text-muted-foreground border border-border">
                  <Search className="size-5" />
                </div>
                <span className="text-xs font-bold text-foreground">
                  No components or pages found
                </span>
                <span className="text-[11px] text-muted-foreground max-w-sm">
                  We couldn't find anything matching &quot;{searchQuery}&quot;. Try searching for &quot;Subjects&quot;, &quot;Graphs&quot;, &quot;Badges&quot;, or &quot;CSV&quot;.
                </span>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const IconComponent = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    data-index={index}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-accent text-accent-foreground shadow-2xs"
                        : "hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <IconComponent className="size-4" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">
                          {item.title}
                        </span>
                        {getCategoryBadge(item.category)}
                      </div>
                      <span className="text-[11px] text-muted-foreground truncate leading-snug">
                        {item.description}
                      </span>
                    </div>

                    {/* Page reference & action arrow */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-medium text-muted-foreground/70 bg-muted/60 px-2 py-0.5 rounded-md">
                        {item.pageName}
                      </span>
                      {isSelected && (
                        <CornerDownLeft className="size-3.5 text-primary animate-pulse" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Keyboard Hints */}
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[9px]">↑</kbd>
                <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[9px]">↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px]">↵</kbd>
                Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-background px-1 py-0.5 font-mono text-[9px]">ESC</kbd>
                Close
              </span>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground/70">
              {filteredItems.length} {filteredItems.length === 1 ? "result" : "results"}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SystemSearchBar;
