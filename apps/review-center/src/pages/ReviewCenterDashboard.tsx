import { useReviewCenterAuth } from "../hooks/useReviewCenterAuth";
import {
  Building2,
  LogOut,
  Users,
  Calendar,
  Award,
  BookOpen,
  CheckCircle2,
  MapPin,
  Mail,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";

export function ReviewCenterDashboard() {
  const { user, logout } = useReviewCenterAuth();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-12">
      {/* Header Navigation */}
      <header className="border-b border-border bg-card/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-foreground tracking-tight">
                  {user?.companyName || user?.reviewCenter?.name || "Review Center Portal"}
                </h1>
                <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full">
                  VERIFIED PARTNER
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Representative: <strong className="text-foreground">{user?.name}</strong> ({user?.employeeId})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-accent text-foreground text-xs font-semibold transition-all cursor-pointer shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Welcome Banner */}
        <div className="p-6 rounded-3xl bg-card border border-border shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Representative Management Portal
            </div>
            <h2 className="text-2xl font-black text-foreground">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-xs text-muted-foreground max-w-xl">
              Manage your center's review program schedules, monitor enrolled candidate progress, and sync board evaluation metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs bg-muted/40 p-3 rounded-2xl border border-border z-10">
            <MapPin className="w-4 h-4 text-primary shrink-0" />
            <div>
              <div className="font-semibold text-foreground">Headquarters Location</div>
              <div className="text-muted-foreground text-[11px]">{user?.location || "Manila, Philippines"}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Enrolled Candidates</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-foreground">248</div>
            <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +14% vs previous cohort
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Active Review Programs</span>
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-black text-foreground">6</div>
            <div className="text-[10px] text-muted-foreground">Medical Technology Licensure</div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Scheduled Review Sessions</span>
              <Calendar className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-foreground">12</div>
            <div className="text-[10px] text-amber-500 font-semibold">3 sessions scheduled this week</div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-border shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>Cohort Mock Board Average</span>
              <Award className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-foreground">88.4%</div>
            <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Top Tier Performance
            </div>
          </div>
        </div>

        {/* Info & Program Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left 2 Cols: Review Programs Roster */}
          <div className="md:col-span-2 space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" /> Active Review Programs & Modules
                </h3>
                <span className="text-xs font-semibold text-muted-foreground">6 Enrolled Classes</span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-muted/20 border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Clinical Microscopy Intensive Review</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Category: Clinical Microscopy & Parasitology</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Clinical Chemistry Comprehensive Drills</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Category: Clinical Chemistry</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/20 border border-border flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Hematology Board Exam Readiness Prep</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Category: Hematology</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Representative Account Profile */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-foreground border-b border-border pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Representative Details
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Full Name</span>
                  <span className="font-bold text-foreground">{user?.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Email Address</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-primary" /> {user?.email}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Employee ID</span>
                  <span className="font-mono text-primary font-bold">{user?.employeeId}</span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] uppercase font-bold block">Partner Company</span>
                  <span className="font-bold text-foreground">{user?.companyName || user?.reviewCenter?.name}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReviewCenterDashboard;
