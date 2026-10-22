import React, { useState, useMemo, useRef } from "react";
import {
  Search,
  Building2,
  Globe,
  Users,
  Check,
  Plus,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCandidates } from "@/features/students/api/useCandidates";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";

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
  const { user } = useReviewCenterAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "internal" | "external">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch enrolled candidates from review-center candidates API
  const { data: candidatesData, isLoading: isCandidatesLoading } = useCandidates();

  // Combine review center representative + candidates into searchable list
  const availableUsers: CalendarAttendeeItem[] = useMemo(() => {
    const list: CalendarAttendeeItem[] = [];

    // Current representative (Internal)
    if (user?.email) {
      list.push({
        id: user.id || "rc-rep",
        name: user.name || "Review Center Representative",
        email: user.email,
        role: "Representative",
        accountType: "internal",
        organization: user.companyName || "Review Center",
        initials: (user.name || "RC").slice(0, 2).toUpperCase(),
      });
    }

    // Enrolled candidates / students (External / Students)
    const candidates = candidatesData?.candidates || [];
    candidates.forEach((c) => {
      if (c.email && !list.some((existing) => existing.email.toLowerCase() === c.email.toLowerCase())) {
        list.push({
          id: c.id,
          name: c.name || c.email,
          email: c.email,
          role: c.batch ? `Candidate (${c.batch})` : "Review Candidate",
          accountType: "external",
          organization: c.companyName || user?.companyName || "Partner Review Center",
          initials: (c.name || "ST").slice(0, 2).toUpperCase(),
        });
      }
    });

    return list;
  }, [user, candidatesData]);

  // Filter based on search query and active tab
  const filteredUsers = useMemo(() => {
    let result = availableUsers;

    if (activeTab === "internal") {
      result = result.filter((u) => u.accountType === "internal");
    } else if (activeTab === "external") {
      result = result.filter((u) => u.accountType === "external");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.role && u.role.toLowerCase().includes(q)) ||
          (u.organization && u.organization.toLowerCase().includes(q))
      );
    }

    return result;
  }, [availableUsers, activeTab, searchQuery]);

  const internalAccounts = useMemo(
    () => filteredUsers.filter((u) => u.accountType === "internal"),
    [filteredUsers]
  );

  const externalAccounts = useMemo(
    () => filteredUsers.filter((u) => u.accountType === "external"),
    [filteredUsers]
  );

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

    const newAttendee: CalendarAttendeeItem = {
      name: trimmed,
      email,
      role: "Guest / Participant",
      accountType: "external",
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

  const totalInternal = attendees.filter((a) => a.accountType === "internal").length;
  const totalExternal = attendees.filter((a) => a.accountType === "external").length;

  return (
    <div className="space-y-1.5 font-sans">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold text-foreground/80 tracking-tight flex items-center gap-1.5">
          <Users size={12} className="text-muted-foreground" />
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
              placeholder="Search participants by name or email..."
              disabled={!canManage}
              className="h-8.5 text-xs rounded-xl pr-8 pl-8 border-border bg-background"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-[360px] sm:w-[420px] p-0 rounded-2xl shadow-xl border border-border bg-popover text-popover-foreground flex flex-col font-sans max-h-[380px] overflow-hidden z-50"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Internal vs External Tabs */}
          <div className="flex items-center border-b border-border/80 bg-muted/40 p-1.5 gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({availableUsers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("internal")}
              className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "internal"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 size={12} className="text-primary" />
              <span>Staff ({availableUsers.filter((u) => u.accountType === "internal").length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("external")}
              className={`flex-1 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === "external"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe size={12} className="text-amber-600 dark:text-amber-400" />
              <span>Candidates ({availableUsers.filter((u) => u.accountType === "external").length})</span>
            </button>
          </div>

          {/* Account Lists Container */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3 min-h-0">
            {isCandidatesLoading ? (
              <div className="py-8 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Loader2 size={18} className="animate-spin text-primary" />
                <span>Loading candidates directory...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground space-y-2">
                <p>No matching accounts found.</p>
                {searchQuery.includes("@") && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddCustomEmail}
                    className="h-7 text-xs rounded-lg gap-1 border-primary/40 text-primary"
                  >
                    <Plus size={12} />
                    <span>Add &quot;{searchQuery}&quot; as participant</span>
                  </Button>
                )}
              </div>
            ) : (
              <>
                {/* Internal Section */}
                {(activeTab === "all" || activeTab === "internal") && internalAccounts.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <Building2 size={11} className="text-primary" />
                      <span>Review Center Staff</span>
                      <span className="text-[9px] font-normal text-muted-foreground">({internalAccounts.length})</span>
                    </div>
                    {internalAccounts.map((u) => {
                      const selected = isSelected(u.email);
                      return (
                        <div
                          key={u.email}
                          onClick={() => handleToggleAttendee(u)}
                          className={`p-2.5 flex items-center justify-between rounded-xl hover:bg-accent/40 cursor-pointer transition-colors group ${
                            selected ? "bg-accent/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-7 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                              {u.initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {u.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight bg-primary/15 text-primary">
                                  Internal
                                </span>
                              </div>
                              <span className="text-[10.5px] text-muted-foreground truncate">
                                {u.email}
                              </span>
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
                    })}
                  </div>
                )}

                {/* External Section */}
                {(activeTab === "all" || activeTab === "external") && externalAccounts.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      <Globe size={11} className="text-amber-600 dark:text-amber-400" />
                      <span>Enrolled Candidates</span>
                      <span className="text-[9px] font-normal text-muted-foreground">({externalAccounts.length})</span>
                    </div>
                    {externalAccounts.map((u) => {
                      const selected = isSelected(u.email);
                      return (
                        <div
                          key={u.email}
                          onClick={() => handleToggleAttendee(u)}
                          className={`p-2.5 flex items-center justify-between rounded-xl hover:bg-accent/40 cursor-pointer transition-colors group ${
                            selected ? "bg-accent/30" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="size-7 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                              {u.initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                  {u.name}
                                </span>
                                <span className="text-[9px] px-1.5 py-0.2 rounded font-bold uppercase tracking-tight bg-amber-500/15 text-amber-700 dark:text-amber-300">
                                  External
                                </span>
                              </div>
                              <span className="text-[10.5px] text-muted-foreground truncate">
                                {u.email}
                              </span>
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
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Custom Email Adder footer if query contains @ */}
          {searchQuery.includes("@") && !filteredUsers.some((u) => u.email.toLowerCase() === searchQuery.toLowerCase()) && (
            <div className="p-2 border-t border-border/80 bg-muted/30 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-muted-foreground truncate">
                Add &quot;{searchQuery}&quot;
              </span>
              <Button
                type="button"
                size="sm"
                onClick={handleAddCustomEmail}
                className="h-7 text-xs rounded-lg gap-1"
              >
                <Plus size={12} />
                <span>Add Participant</span>
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected Attendees Chips List */}
      {attendees.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto pr-1">
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
