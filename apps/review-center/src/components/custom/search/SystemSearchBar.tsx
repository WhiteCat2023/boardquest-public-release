import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  Award,
  Settings,
  PlusCircle,
  Upload,
  ArrowRight,
  CornerDownLeft,
  X,
  Sparkles,
  BarChart3,
  CalendarPlus,
  FileSpreadsheet,
  FileText,
  FlaskConical,
  BookOpen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";

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
}

const REVIEW_CENTER_SEARCH_ITEMS: SearchItem[] = [
  // ── PAGES ──
  {
    id: "page-dashboard",
    title: "Dashboard",
    description: "Operational overview of enrolled candidates, performance KPIs, and upcoming review schedules",
    category: "page",
    pageName: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    keywords: ["dashboard", "home", "overview", "kpi", "summary", "stats"],
  },
  {
    id: "page-candidates",
    title: "Enrolled Students",
    description: "Directory of candidate examinees, school year cohorts, and student profiles",
    category: "page",
    pageName: "Enrolled Students",
    path: "/candidates",
    icon: Users,
    keywords: ["students", "candidates", "roster", "directory", "cohorts", "school year", "enrolled"],
  },
  {
    id: "page-add-students",
    title: "Add Candidates",
    description: "Register individual examinees or batch enroll students using CSV spreadsheet upload",
    category: "page",
    pageName: "Enrolled Students",
    path: "/candidates/add",
    icon: PlusCircle,
    keywords: ["add", "enroll", "register", "bulk", "import", "csv", "excel", "new student"],
  },
  {
    id: "page-scores",
    title: "Scores & Grades",
    description: "Performance grade matrix, MedTech subject mastery, assessment drill results, and PDF reports",
    category: "page",
    pageName: "Scores & Grades",
    path: "/scores",
    icon: Award,
    keywords: ["scores", "grades", "matrix", "performance", "exam", "drills", "mastery", "results"],
  },
  {
    id: "page-schedules",
    title: "Calendar",
    description: "Interactive calendar with diagnostic drills, lecture dates, and mock board exam timelines",
    category: "page",
    pageName: "Calendar",
    path: "/calendar",
    icon: Calendar,
    keywords: ["schedules", "calendar", "events", "mock board", "diagnostic", "drills", "timeline", "dates"],
  },
  {
    id: "page-settings",
    title: "Review Center Settings",
    description: "Company profile, branch details, contact credentials, and security preferences",
    category: "page",
    pageName: "Settings",
    path: "/settings",
    icon: Settings,
    keywords: ["settings", "profile", "account", "password", "security", "preferences", "company"],
  },

  // ── COMPONENTS & SECTIONS ──
  {
    id: "comp-evaluation-calendar",
    title: "Calendar View",
    description: "Month, week, and list view of upcoming review drills, mock exams, and academic milestones",
    category: "component",
    pageName: "Calendar",
    path: "/calendar",
    icon: Calendar,
    keywords: ["calendar", "monthly view", "drills", "mock exams", "schedule grid"],
  },
  {
    id: "comp-candidate-matrix",
    title: "Candidate Performance Matrix",
    description: "Multi-subject score matrix, individual candidate rank, and passing rate forecast",
    category: "component",
    pageName: "Scores & Grades",
    path: "/scores",
    icon: BarChart3,
    keywords: ["matrix", "candidate scores", "rank", "passing forecast", "drill records"],
  },
  {
    id: "comp-medtech-subjects",
    title: "MedTech Licensure Subjects Breakdown",
    description: "Subject mastery across Clinical Chemistry, Micro-Para, Hematology, Immuno-Sero, Microscopy, and Histopath",
    category: "component",
    pageName: "Scores & Grades",
    path: "/scores",
    icon: FlaskConical,
    keywords: ["subjects", "clinical chemistry", "microbiology", "hematology", "immunology", "microscopy", "histopathology"],
  },
  {
    id: "comp-kpi-cards",
    title: "Review Center Performance KPI Cards",
    description: "Total enrolled examinees, active cohorts, diagnostic readiness, and passing rate milestones",
    category: "component",
    pageName: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
    keywords: ["kpi", "cards", "metrics", "stats", "active examinees", "pass rate"],
  },
  {
    id: "comp-school-year-directory",
    title: "School Year Cohorts Directory",
    description: "Directory of academic cohorts, candidate tallies per school year, and completion rates",
    category: "component",
    pageName: "Enrolled Students",
    path: "/candidates",
    icon: BookOpen,
    keywords: ["school year", "cohorts", "directory", "batches", "active years"],
  },

  // ── QUICK ACTIONS ──
  {
    id: "act-enroll-student",
    title: "Enroll Single Candidate",
    description: "Register a single student with school ID, full name, and email credentials",
    category: "action",
    pageName: "Enrolled Students",
    path: "/candidates/add",
    icon: PlusCircle,
    keywords: ["enroll", "add student", "register candidate", "single candidate"],
  },
  {
    id: "act-bulk-import",
    title: "Bulk Import Candidates via CSV",
    description: "Upload an Excel or CSV spreadsheet to enroll multiple student candidates at once",
    category: "action",
    pageName: "Enrolled Students",
    path: "/candidates/add?tab=bulk",
    icon: FileSpreadsheet,
    keywords: ["bulk import", "csv", "excel", "spreadsheet", "batch upload", "import candidates"],
  },
  {
    id: "act-create-schedule",
    title: "Schedule Review Drill / Mock Exam",
    description: "Add a new diagnostic exam, lecture session, or pre-board drill date to the calendar",
    category: "action",
    pageName: "Calendar",
    path: "/calendar",
    icon: CalendarPlus,
    keywords: ["create schedule", "add event", "mock board date", "diagnostic drill", "add exam"],
  },
  {
    id: "act-export-scores",
    title: "Export Candidate Grade Reports (PDF)",
    description: "Preview and download official candidate performance summaries and PDF reports",
    category: "action",
    pageName: "Scores & Grades",
    path: "/scores",
    icon: FileText,
    keywords: ["export", "pdf", "grade report", "download summary", "print scores"],
  },
  {
    id: "act-manage-school-years",
    title: "Manage School Year Cohorts",
    description: "Create new academic school years, rename cohorts, or archive past batches",
    category: "action",
    pageName: "Enrolled Students",
    path: "/candidates",
    icon: GraduationCap,
    keywords: ["manage school years", "create year", "new cohort", "rename school year"],
  },
  {
    id: "act-account-settings",
    title: "Update Account & Security Settings",
    description: "Modify representative name, email, phone number, and account password",
    category: "action",
    pageName: "Settings",
    path: "/settings",
    icon: Settings,
    keywords: ["password", "change password", "security", "profile", "account settings"],
  },
];

export function SystemSearchBar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<SearchCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  // Filter items based on query and category
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return REVIEW_CENTER_SEARCH_ITEMS.filter((item) => {
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
  }, [searchQuery, activeCategory]);

  // Keep selected item within bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, activeCategory]);

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
      setActiveCategory("all");
      setSelectedIndex(0);
    }
  }, [isOpen]);

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
    return {
      all: REVIEW_CENTER_SEARCH_ITEMS.length,
      component: REVIEW_CENTER_SEARCH_ITEMS.filter((i) => i.category === "component").length,
      page: REVIEW_CENTER_SEARCH_ITEMS.filter((i) => i.category === "page").length,
      action: REVIEW_CENTER_SEARCH_ITEMS.filter((i) => i.category === "action").length,
    };
  }, []);

  const getCategoryBadge = (category: SearchItem["category"]) => {
    switch (category) {
      case "component":
        return (
          <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20">
            Component
          </Badge>
        );
      case "page":
        return (
          <Badge variant="success" className="px-1.5 py-0 text-[10px] font-semibold">
            Page
          </Badge>
        );
      case "action":
        return (
          <Badge variant="warning" className="px-1.5 py-0 text-[10px] font-semibold">
            Action
          </Badge>
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
        <Kbd className="ml-auto pointer-events-none hidden sm:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border/80 bg-background px-1 font-mono text-[9px] font-medium text-muted-foreground/80 group-hover:text-foreground transition-colors">
          <span className="text-[10px]">⌘</span>K
        </Kbd>
      </button>

      {/* ── Search Modal Dialog ── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          showCloseButton={false}
          className="p-0 max-w-xl sm:max-w-2xl gap-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl font-sans"
          onKeyDown={handleDialogKeyDown}
        >
          <DialogTitle className="sr-only">Review Center System Search</DialogTitle>

          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
            <Search className="size-4 text-primary shrink-0" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components, pages, sections, actions... (e.g. 'Students', 'Schedules', 'Scores', 'CSV')"
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
            <Kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border bg-muted/60 px-1.5 font-mono text-[10px] text-muted-foreground">
              ESC
            </Kbd>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border bg-muted/30 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === "all"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              All ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("page")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === "page"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Pages ({counts.page})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("component")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === "component"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Components ({counts.component})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory("action")}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === "action"
                  ? "bg-background text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Actions ({counts.action})
            </button>
          </div>

          {/* Results List */}
          <div ref={listRef} className="max-h-96 overflow-y-auto p-2 divide-y divide-border/40">
            {filteredItems.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                  <Search className="size-5" />
                </div>
                <p className="text-sm font-semibold text-foreground">No matching items found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Try searching for terms like &ldquo;candidates&rdquo;, &ldquo;scores&rdquo;, &ldquo;schedules&rdquo;, or &ldquo;import&rdquo;.
                </p>
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
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150 group ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div
                      className={`size-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-2xs"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <IconComponent className="size-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold truncate ${
                            isSelected ? "text-primary font-bold" : "text-foreground"
                          }`}
                        >
                          {item.title}
                        </span>
                        {getCategoryBadge(item.category)}
                        <span className="text-[10px] text-muted-foreground/70 hidden sm:inline truncate">
                          in {item.pageName}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isSelected && (
                        <span className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-primary">
                          Jump to <CornerDownLeft className="size-3" />
                        </span>
                      )}
                      <ArrowRight
                        className={`size-3.5 transition-transform ${
                          isSelected
                            ? "text-primary translate-x-0.5"
                            : "text-muted-foreground/40 group-hover:text-muted-foreground"
                        }`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t border-border bg-muted/40 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="flex items-center gap-1">
                <Kbd className="px-1 py-0.5 rounded bg-background border border-border text-[9px] font-mono">↑</Kbd>
                <Kbd className="px-1 py-0.5 rounded bg-background border border-border text-[9px] font-mono">↓</Kbd>
                <span className="hidden sm:inline">to navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-[9px] font-mono">↵</Kbd>
                <span className="hidden sm:inline">to select</span>
              </span>
              <span className="flex items-center gap-1">
                <Kbd className="px-1 py-0.5 rounded bg-background border border-border text-[9px] font-mono">ESC</Kbd>
                <span className="hidden sm:inline">to close</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-primary/80 font-medium">
              <Sparkles className="size-3" />
              <span>Review Center Quick Search</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SystemSearchBar;
