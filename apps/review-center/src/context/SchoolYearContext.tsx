import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useSchoolYearRecords,
  useCandidates,
  useSetCurrentSchoolYear,
  type SchoolYearRecord,
} from "@/features/students/api/useCandidates";
import { isValidSchoolYear } from "@/lib/utils";
import { SchoolYearCMSModal } from "@/components/custom/sidebar/SchoolYearCMSModal";

const STORAGE_KEY = "bq_rc_active_school_year";
const DEFAULT_FALLBACK_YEAR = "2026-2027";

export interface SchoolYearContextType {
  activeSchoolYear: string;
  currentSchoolYear: string | null;
  setActiveSchoolYear: (year: string) => void;
  selectSchoolYear: (year: string) => void;
  setCurrentSchoolYear: (year: string) => void;
  schoolYears: string[];
  schoolYearRecords: SchoolYearRecord[];
  isLoading: boolean;
  isCMSModalOpen: boolean;
  cmsModalMode: "list" | "create";
  openCMSModal: (initialMode?: "list" | "create") => void;
  closeCMSModal: () => void;
}

const SchoolYearContext = createContext<SchoolYearContextType | undefined>(
  undefined
);

export function SchoolYearProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: dbSchoolYearRecords = [], isLoading: isDbYearsLoading } =
    useSchoolYearRecords();
  const { data: candidatesData, isLoading: isCandidatesLoading } =
    useCandidates();

  const setCurrentMutation = useSetCurrentSchoolYear();

  const candidateYears = candidatesData?.schoolYears || [];

  // Identify which school year record in the database is flagged as isCurrent
  const currentDbSchoolYear = useMemo(() => {
    const currentRecord = dbSchoolYearRecords.find((r) => r.isCurrent);
    return currentRecord ? currentRecord.schoolYear : null;
  }, [dbSchoolYearRecords]);

  // Consolidate all available school years from database and candidate records
  const schoolYears = useMemo(() => {
    const dbYears = dbSchoolYearRecords.map((r) => r.schoolYear);
    const combined = Array.from(
      new Set([...dbYears, ...candidateYears])
    ).filter(Boolean);

    if (combined.length === 0) {
      return [currentDbSchoolYear || DEFAULT_FALLBACK_YEAR];
    }

    return combined.sort((a, b) => b.localeCompare(a));
  }, [dbSchoolYearRecords, candidateYears, currentDbSchoolYear]);

  // Initial state derived from URL route, search params, localStorage, or fallback
  const [activeSchoolYear, setActiveSchoolYearState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      // 1. Path param check (e.g. /candidates/2028-2029)
      const match = window.location.pathname.match(
        /^\/(?:candidates|students)\/([^/]+)/
      );
      if (match && match[1]) {
        const routeYear = decodeURIComponent(match[1]);
        if (isValidSchoolYear(routeYear)) return routeYear;
      }

      // 2. Query param check (e.g. ?sy=2028-2029)
      const queryYear = new URLSearchParams(window.location.search).get("sy");
      if (queryYear && isValidSchoolYear(queryYear)) return queryYear;

      // 3. Saved localStorage
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && isValidSchoolYear(saved)) return saved;
    }

    return DEFAULT_FALLBACK_YEAR;
  });

  // When backend data loads, if no saved selection or URL param exists, initialize from currentDbSchoolYear once
  const hasInitializedFromDbRef = useRef(false);
  useEffect(() => {
    if (isDbYearsLoading || hasInitializedFromDbRef.current) return;
    hasInitializedFromDbRef.current = true;

    const hasExplicitRouteParam =
      location.pathname.match(/^\/(?:candidates|students)\/([^/]+)/) ||
      new URLSearchParams(location.search).has("sy");

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!hasExplicitRouteParam && !saved && currentDbSchoolYear) {
      setActiveSchoolYearState(currentDbSchoolYear);
      localStorage.setItem(STORAGE_KEY, currentDbSchoolYear);
    }
  }, [currentDbSchoolYear, isDbYearsLoading, location.pathname, location.search]);

  // Modal state for the School Year CMS
  const [isCMSModalOpen, setIsCMSModalOpen] = useState(false);
  const [cmsModalMode, setCmsModalMode] = useState<"list" | "create">("list");

  // Keep state valid: ONLY AFTER data has fully loaded! Never overwrite during loading!
  useEffect(() => {
    if (isDbYearsLoading || isCandidatesLoading) return;

    if (schoolYears.length > 0 && !schoolYears.includes(activeSchoolYear)) {
      const fallback = currentDbSchoolYear || schoolYears[0];
      if (fallback && fallback !== activeSchoolYear) {
        setActiveSchoolYearState(fallback);
        localStorage.setItem(STORAGE_KEY, fallback);
      }
    }
  }, [
    schoolYears,
    activeSchoolYear,
    isDbYearsLoading,
    isCandidatesLoading,
    currentDbSchoolYear,
  ]);

  // Sync route -> context only when user navigates externally via address bar or back/forward
  useEffect(() => {
    // 1. Path param (e.g. /candidates/2026-2027)
    const match = location.pathname.match(
      /^\/(?:candidates|students)\/([^/]+)/
    );
    if (match && match[1]) {
      const routeYear = decodeURIComponent(match[1]);
      if (isValidSchoolYear(routeYear) && routeYear !== activeSchoolYear) {
        setActiveSchoolYearState(routeYear);
        localStorage.setItem(STORAGE_KEY, routeYear);
        return;
      }
    }

    // 2. Query param (e.g. ?sy=2026-2027)
    const queryYear = new URLSearchParams(location.search).get("sy");
    if (
      queryYear &&
      isValidSchoolYear(queryYear) &&
      queryYear !== activeSchoolYear
    ) {
      setActiveSchoolYearState(queryYear);
      localStorage.setItem(STORAGE_KEY, queryYear);
    }
  }, [location.pathname, location.search, activeSchoolYear]);

  const setActiveSchoolYear = useCallback((year: string) => {
    if (!year) return;
    setActiveSchoolYearState(year);
    localStorage.setItem(STORAGE_KEY, year);
  }, []);

  const setCurrentSchoolYear = useCallback(
    (year: string) => {
      if (!year) return;
      setActiveSchoolYearState(year);
      localStorage.setItem(STORAGE_KEY, year);
      setCurrentMutation.mutate(year);
    },
    [setCurrentMutation]
  );

  const selectSchoolYear = useCallback(
    (year: string) => {
      if (!year) return;
      setActiveSchoolYearState(year);
      localStorage.setItem(STORAGE_KEY, year);

      // Persist as current school year in the database silently via optimistic update
      setCurrentMutation.mutate(year);

      // Smart Route Redirection when changing school year
      if (location.pathname.startsWith("/candidates")) {
        const currentParam = location.pathname.match(/^\/candidates\/([^/]+)/)?.[1];
        if (currentParam !== encodeURIComponent(year)) {
          navigate(`/candidates/${encodeURIComponent(year)}`, { replace: true });
        }
      } else if (location.pathname.startsWith("/scores")) {
        if (location.pathname.includes("/assessment/")) {
          const subjectMatch = location.pathname.match(
            /\/scores\/subject\/([^/]+)/
          );
          if (subjectMatch && subjectMatch[1]) {
            navigate(
              `/scores/subject/${subjectMatch[1]}?sy=${encodeURIComponent(
                year
              )}`,
              { replace: true }
            );
          } else {
            navigate(`/scores?sy=${encodeURIComponent(year)}`, { replace: true });
          }
        } else {
          const searchParams = new URLSearchParams(location.search);
          if (searchParams.get("sy") !== year) {
            searchParams.set("sy", year);
            navigate(`${location.pathname}?${searchParams.toString()}`, { replace: true });
          }
        }
      }
    },
    [location.pathname, location.search, navigate, setCurrentMutation]
  );

  const openCMSModal = useCallback((mode: "list" | "create" = "list") => {
    setCmsModalMode(mode);
    setIsCMSModalOpen(true);
  }, []);

  const closeCMSModal = useCallback(() => {
    setIsCMSModalOpen(false);
  }, []);

  const value = useMemo<SchoolYearContextType>(
    () => ({
      activeSchoolYear,
      currentSchoolYear: currentDbSchoolYear,
      setActiveSchoolYear,
      selectSchoolYear,
      setCurrentSchoolYear,
      schoolYears,
      schoolYearRecords: dbSchoolYearRecords,
      isLoading: isDbYearsLoading || isCandidatesLoading,
      isCMSModalOpen,
      cmsModalMode,
      openCMSModal,
      closeCMSModal,
    }),
    [
      activeSchoolYear,
      currentDbSchoolYear,
      setActiveSchoolYear,
      selectSchoolYear,
      setCurrentSchoolYear,
      schoolYears,
      dbSchoolYearRecords,
      isDbYearsLoading,
      isCandidatesLoading,
      isCMSModalOpen,
      cmsModalMode,
      openCMSModal,
      closeCMSModal,
    ]
  );

  return (
    <SchoolYearContext.Provider value={value}>
      {children}
      <SchoolYearCMSModal />
    </SchoolYearContext.Provider>
  );
}

export function useActiveSchoolYear() {
  const context = useContext(SchoolYearContext);
  if (!context) {
    throw new Error(
      "useActiveSchoolYear must be used within a SchoolYearProvider"
    );
  }
  return context;
}

export default SchoolYearContext;
