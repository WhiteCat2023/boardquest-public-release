import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Search,
  Building2,
  Globe,
  User,
  Check,
  Plus,
  X,
  ChevronDown,
  Mail,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/features/users/api/useUsers";
import { useStudents } from "@/features/students/api/useStudent";
import useRoleFlags from "@/hooks/useRoleFlags";

export interface CalendarAttendeeItem {
  id?: string;
  name: string;
  email: string;
  role?: string;
  accountType: "internal" | "external";
  avatarUrl?: string;
  initials?: string;
  organization?: string;
}

interface CalendarAttendeeSelectProps {
  attendees: CalendarAttendeeItem[];
  onChange: (attendees: CalendarAttendeeItem[]) => void;
  canManage?: boolean;
}

export function CalendarAttendeeSelect({
  attendees,
  onChange,
  canManage = true,
}: CalendarAttendeeSelectProps) {
  const { userRole } = useRoleFlags();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "internal" | "external">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch BoardQuest Admin/Faculty & Review Center users
  const { data: usersData, isLoading: isUsersLoading } = useUsers({
    limit: 200,
  });

  // Fetch BoardQuest Students
  const { data: studentsData, isLoading: isStudentsLoading } = useStudents({
    take: 100,
  });

  // Consolidate BoardQuest users into unified attendee options
  const allUsersList = useMemo<CalendarAttendeeItem[]>(() => {
    const list: CalendarAttendeeItem[] = [];
    const seenEmails = new Set<string>();

    // 1. Process administrative & review center faculty users
    const rawUsers = usersData?.users || usersData?.faculties || [];
    for (const u of rawUsers) {
      const email = (u.email || "").trim().toLowerCase();
      if (!email || seenEmails.has(email)) continue;
      seenEmails.add(email);

      const roleStr = String(u.role || "").toUpperCase().trim();
      const isExternal =
        roleStr === "REVIEWCENTER" ||
        roleStr === "EXTERNAL" ||
        roleStr.includes("REVIEW_CENTER") ||
        Boolean(u.companyName);

      // Deans should not be able to see other deans; only teacher and teamlead for internal
      if (userRole === "DEAN" && (roleStr === "DEAN" || roleStr === "SUPERADMIN")) {
        continue;
      }

      let roleLabel = "Teacher / Faculty";
      if (u.companyName) {
        roleLabel = u.companyName;
      } else if (roleStr === "SUPERADMIN") {
        roleLabel = "Super Admin";
      } else if (roleStr === "DEAN") {
        roleLabel = "Dean";
      } else if (roleStr === "TEAMLEAD") {
        roleLabel = "Team Lead";
      } else if (roleStr === "TEACHER") {
        roleLabel = "Faculty Instructor";
      } else if (isExternal) {
        roleLabel = "Review Center Partner";
      }

      list.push({
        id: u.id,
        name: u.name || `${u.firstName || ""} ${u.lastName || ""}`.trim() || email,
        email,
        role: roleLabel,
        organization: u.companyName || "Southwestern University PHINMA",
        accountType: isExternal ? "external" : "internal",
        avatarUrl: u.avatarUrl,
        initials: (u.name || email).substring(0, 2).toUpperCase(),
      });
    }

    // 2. Process enrolled students
    const rawStudents = studentsData?.students || [];
    for (const s of rawStudents) {
      const email = (s.email || "").trim().toLowerCase();
      if (!email || seenEmails.has(email)) continue;
      seenEmails.add(email);

      list.push({
        id: s.id,
        name: s.name || email,
        email,
        role: "Student",
        organization: "SWU PHINMA MedTech",
        accountType: "internal",
        avatarUrl: (s as any).avatarUrl,
        initials: (s.name || email).substring(0, 2).toUpperCase(),
      });
    }

    return list;
  }, [usersData, studentsData]);

  // Filter users by search term
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allUsersList.filter((u) => {
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role && u.role.toLowerCase().includes(q)) ||
        (u.organization && u.organization.toLowerCase().includes(q))
      );
    });
  }, [allUsersList, searchQuery]);

  // Partition into Internal and External accounts
  const internalAccounts = useMemo(
    () => filteredUsers.filter((u) => u.accountType === "internal"),
    [filteredUsers]
  );

  const externalAccounts = useMemo(
    () => filteredUsers.filter((u) => u.accountType === "external"),
    [filteredUsers]
  );

  // Check if an attendee is currently selected
  const isSelected = (email: string) => {
    const target = email.trim().toLowerCase();
    return attendees.some((a) => a.email.trim().toLowerCase() === target);
  };

  const handleToggleAttendee = (candidate: CalendarAttendeeItem) => {
    if (!canManage) return;
    const targetEmail = candidate.email.trim().toLowerCase();
    const exists = attendees.some((a) => a.email.trim().toLowerCase() === targetEmail);

    if (exists) {
      onChange(attendees.filter((a) => a.email.trim().toLowerCase() !== targetEmail));
    } else {
      onChange([...attendees, candidate]);
    }
  };

  const handleAddCustomEmail = () => {
    if (!canManage) return;
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const email = trimmed.toLowerCase();
    if (isSelected(email)) {
      setSearchQuery("");
      return;
    }

    const isInternalDomain =
      email.includes("swumedtech.edu.ph") || email.includes("boardquest.online");

    const newAttendee: CalendarAttendeeItem = {
      name: trimmed,
      email,
      role: isInternalDomain ? "Internal Account" : "External Guest",
      accountType: isInternalDomain ? "internal" : "external",
      initials: trimmed.substring(0, 2).toUpperCase(),
    };

    onChange([...attendees, newAttendee]);
    setSearchQuery("");
    setIsOpen(false);
  };

  const handleRemoveAttendee = (email: string) => {
    if (!canManage) return;
    const target = email.trim().toLowerCase();
    onChange(attendees.filter((a) => a.email.trim().toLowerCase() !== target));
  };

  const isLoading = isUsersLoading || isStudentsLoading;

  const totalInternal = attendees.filter((a) => a.accountType === "internal").length;
  const totalExternal = attendees.filter((a) => a.accountType === "external").length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-foreground/80 tracking-tight flex items-center gap-1.5">
          <User size={12} className="text-muted-foreground" />
          <span>Required Attendees</span>
        </label>
        {attendees.length > 0 && (
          <span className="text-[10px] text-muted-foreground font-medium">
            {attendees.length} selected ({totalInternal} internal, {totalExternal} external)
          </span>
        )}
      </div>

      {/* Search Bar with Popover Dropdown */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!isOpen) setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (searchQuery.includes("@")) {
                    handleAddCustomEmail();
                  }
                }
              }}
              placeholder="Search internal/external users or enter email..."
              className="h-9 rounded-xl text-xs bg-background border-border/80 pl-8.5 pr-8 focus-visible:ring-1 focus-visible:ring-primary/30"
              disabled={!canManage}
            />
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/80 pointer-events-none"
            />
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="absolute right-2 top-1/2 -translate-y-1/2 size-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              tabIndex={-1}
            >
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[380px] max-w-[90vw] p-0 rounded-2xl shadow-xl border border-border/70 bg-card z-50 font-sans overflow-hidden"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header Filter Tabs: All, Internal, External */}
          <div className="p-2 border-b border-border/60 bg-muted/30 flex items-center justify-between gap-1 shrink-0">
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg text-[10.5px]">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  activeTab === "all"
                    ? "bg-card text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({filteredUsers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("internal")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === "internal"
                    ? "bg-card text-primary shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 size={11} />
                <span>Internal ({internalAccounts.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("external")}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                  activeTab === "external"
                    ? "bg-card text-amber-600 dark:text-amber-400 shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Globe size={11} />
                <span>External ({externalAccounts.length})</span>
              </button>
            </div>

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer px-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Scrollable Results List */}
          <div className="max-h-[280px] overflow-y-auto divide-y divide-border/40 text-xs">
            {isLoading && (
              <div className="flex items-center justify-center p-6 text-muted-foreground gap-2">
                <Loader2 size={15} className="animate-spin text-primary" />
                <span className="text-xs">Loading BoardQuest accounts...</span>
              </div>
            )}

            {!isLoading && (
              <>
                {/* 1. INTERNAL SECTION */}
                {(activeTab === "all" || activeTab === "internal") && (
                  <div>
                    <div className="px-3 py-1.5 bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
                      <span className="flex items-center gap-1.5 text-primary">
                        <Building2 size={12} />
                        <span>Internal Accounts (Faculty, Admin & Students)</span>
                      </span>
                      <span>{internalAccounts.length}</span>
                    </div>

                    {internalAccounts.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
                        No matching internal accounts found.
                      </div>
                    ) : (
                      internalAccounts.map((user) => {
                        const selected = isSelected(user.email);
                        return (
                          <div
                            key={user.email}
                            onClick={() => handleToggleAttendee(user)}
                            className={`px-3 py-2 flex items-center justify-between gap-2.5 hover:bg-muted/50 cursor-pointer transition-colors ${
                              selected ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                                  selected
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-primary/10 text-primary border-primary/20"
                                }`}
                              >
                                {user.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground text-xs truncate">
                                    {user.name}
                                  </span>
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 shrink-0 font-medium">
                                    {user.role}
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-muted-foreground truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {selected ? (
                                <div className="size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-2xs">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="size-5 rounded-full border border-border flex items-center justify-center hover:border-primary">
                                  <Plus size={11} className="text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* 2. EXTERNAL SECTION */}
                {(activeTab === "all" || activeTab === "external") && (
                  <div>
                    <div className="px-3 py-1.5 bg-muted/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between sticky top-0 z-10 backdrop-blur-xs">
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <Globe size={12} />
                        <span>External Accounts (Review Center Partners)</span>
                      </span>
                      <span>{externalAccounts.length}</span>
                    </div>

                    {externalAccounts.length === 0 ? (
                      <div className="px-3 py-2 text-[11px] text-muted-foreground italic">
                        No matching external partner accounts found.
                      </div>
                    ) : (
                      externalAccounts.map((user) => {
                        const selected = isSelected(user.email);
                        return (
                          <div
                            key={user.email}
                            onClick={() => handleToggleAttendee(user)}
                            className={`px-3 py-2 flex items-center justify-between gap-2.5 hover:bg-muted/50 cursor-pointer transition-colors ${
                              selected ? "bg-amber-500/5" : ""
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`size-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 border ${
                                  selected
                                    ? "bg-amber-600 text-white border-amber-600"
                                    : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
                                }`}
                              >
                                {user.initials}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-semibold text-foreground text-xs truncate">
                                    {user.name}
                                  </span>
                                  <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0 font-medium">
                                    {user.role}
                                  </span>
                                </div>
                                <div className="text-[10.5px] text-muted-foreground truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>

                            <div className="shrink-0">
                              {selected ? (
                                <div className="size-5 rounded-full bg-amber-600 text-white flex items-center justify-center shadow-2xs">
                                  <Check size={11} strokeWidth={3} />
                                </div>
                              ) : (
                                <div className="size-5 rounded-full border border-border flex items-center justify-center hover:border-amber-500">
                                  <Plus size={11} className="text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {/* Option to invite custom typed email if not found */}
                {searchQuery.trim().length > 2 && (
                  <div
                    onClick={handleAddCustomEmail}
                    className="p-3 bg-accent/40 hover:bg-accent/70 cursor-pointer transition-colors flex items-center gap-2.5 text-xs text-foreground font-medium border-t border-border/60"
                  >
                    <div className="size-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground shrink-0 border border-border">
                      <Mail size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-foreground font-semibold">
                        Add &quot;{searchQuery.trim()}&quot;
                      </div>
                      <div className="text-[10.5px] text-muted-foreground">
                        Invite as external guest attendee
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="h-6.5 text-[10px] px-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-2xs"
                    >
                      <Plus size={12} className="mr-0.5" />
                      Add
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected Attendees Chips List */}
      {attendees.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {attendees.map((att) => {
            const isInternal = att.accountType === "internal";
            return (
              <div
                key={att.email}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl text-[11px] font-medium border transition-colors ${
                  isInternal
                    ? "bg-primary/8 text-primary border-primary/20"
                    : "bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/25"
                }`}
              >
                <div
                  className={`size-4.5 rounded-full flex items-center justify-center text-[8.5px] font-bold ${
                    isInternal
                      ? "bg-primary text-primary-foreground"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  {att.initials || att.name.substring(0, 2).toUpperCase()}
                </div>

                <div className="flex items-center gap-1 min-w-0">
                  <span className="truncate max-w-[130px] font-semibold text-foreground">
                    {att.name}
                  </span>
                  <span
                    className={`text-[8.5px] px-1 py-0.2 rounded font-bold uppercase tracking-tight ${
                      isInternal
                        ? "bg-primary/15 text-primary"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {isInternal ? "Internal" : "External"}
                  </span>
                </div>

                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAttendee(att.email)}
                    className="text-muted-foreground hover:text-destructive cursor-pointer ml-0.5 p-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    title={`Remove ${att.name}`}
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CalendarAttendeeSelect;
