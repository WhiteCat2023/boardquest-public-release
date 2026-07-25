import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { 
  BarChart2, 
  Search, 
  Sparkles, 
  Cpu, 
  Award, 
  CheckCircle, 
  BookOpen, 
  Flame, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  TrendingDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
type StudentAnalyticsResult = any;

interface StudentListItem {
  id: string;
  name: string;
  email: string;
  level: number;
}

export default function Analytics() {
  const axiosPrivate = useAxiosPrivate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Query: Get all students
  const { data: studentsData } = useQuery({
    queryKey: ["studentsList"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/students/get", {
        params: { take: 100 }
      });
      return response.data?.data?.students || response.data?.data || [];
    }
  });

  const studentsList = Array.isArray(studentsData) 
    ? studentsData 
    : studentsData?.students || [];

  // Filter students by search query
  const filteredStudents = studentsList.filter((s: StudentListItem) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Set first student as default if none selected
  useEffect(() => {
    if (filteredStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedStudentId]);

  // Query: Get selected student's analytics report
  const { data: report, isLoading: isReportLoading, isRefetching } = useQuery<StudentAnalyticsResult>({
    queryKey: ["studentReport", selectedStudentId],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/analytics/student/${selectedStudentId}`);
      return response.data?.data;
    },
    enabled: !!selectedStudentId,
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-4.5rem)] overflow-hidden font-sans bg-background text-foreground">
      {/* Left Sidebar: Student Search & Selection */}
      <div className="w-full lg:w-80 shrink-0 border-r border-border bg-card flex flex-col h-full">
        {/* Search Header */}
        <div className="p-4 border-b border-border flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Search size={14} className="text-primary" />
            Aspirant List
          </h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs bg-muted/40 border border-border text-foreground placeholder:text-muted-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground font-semibold italic">
              No matching aspirants found.
            </div>
          ) : (
            filteredStudents.map((s: StudentListItem) => (
              <div
                key={s.id}
                onClick={() => setSelectedStudentId(s.id)}
                className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${
                  selectedStudentId === s.id 
                    ? "bg-primary/10 border-l-3 border-primary text-primary" 
                    : "hover:bg-accent border-l-3 border-transparent text-foreground"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-foreground">{s.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{s.email}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wide bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                  Lvl {s.level}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Pane: Performance Dashboard */}
      <div className="flex-1 overflow-y-auto bg-background h-full p-6 md:p-8 flex flex-col gap-6">
        {isReportLoading ? (
          <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
            <Card className="p-6 bg-card border border-border rounded-3xl space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48 bg-muted rounded-md" />
                  <Skeleton className="h-4 w-32 bg-muted rounded-md" />
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-28 rounded-2xl bg-muted" />
              <Skeleton className="h-28 rounded-2xl bg-muted" />
              <Skeleton className="h-28 rounded-2xl bg-muted" />
            </div>
          </div>
        ) : !report ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-32 text-center gap-3">
            <BarChart2 size={48} className="text-muted-foreground/40 stroke-[1.5]" />
            <p className="font-bold text-foreground">No Aspirant Selected</p>
            <p className="text-sm max-w-xs">Select an aspirant from the left sidebar to generate performance statistics.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-in fade-in duration-200">
            {/* Student Overview Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                  {report.studentInfo.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
                    {report.studentInfo.name}
                    {isRefetching && (
                      <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full animate-pulse border border-primary/20">
                        Refreshing...
                      </span>
                    )}
                  </h1>
                  <span className="text-xs text-muted-foreground font-medium">{report.studentInfo.email}</span>
                </div>
              </div>

              {/* Badges / Levels */}
              <div className="flex items-center gap-3">
                <div className="bg-card border border-border px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-xs">
                  <Award size={18} className="text-amber-500 stroke-[2]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Level</span>
                    <span className="text-sm font-black text-foreground">{report.studentInfo.level}</span>
                  </div>
                </div>
                <div className="bg-card border border-border px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-xs">
                  <Flame size={18} className="text-orange-500 stroke-[2]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider leading-none">Streak</span>
                    <span className="text-sm font-black text-foreground">{report.studentInfo.streak} Days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Optimization Caching Widget */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-5 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 flex items-center justify-center">
                <Cpu size={180} />
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/10 text-emerald-400 rounded-2xl border border-white/10 backdrop-blur-md">
                  <Cpu size={24} className="stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                    Token-Saving LLM Optimization Engine
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      report.cacheStats.cached 
                        ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/20" 
                        : "bg-blue-500/25 text-blue-300 border border-blue-400/20"
                    }`}>
                      Cache {report.cacheStats.cached ? "HIT" : "MISS"}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug max-w-xl">
                    Performance state hash generated from consolidated logs. Subsequent analyses use **0 model tokens** if metrics remain identical.
                  </p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-4 md:gap-1.5 text-right items-end justify-between w-full md:w-auto border-t md:border-t-0 border-white/10 pt-4 md:pt-0 relative z-10">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Estimated Token Savings</span>
                  <span className="text-sm font-black text-emerald-400">
                    {report.cacheStats.cached ? "100% Savings (Cached Response)" : "92% Savings (Compressed Summary Input)"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">State Signature Hash</span>
                  <span className="text-[10px] font-mono text-indigo-300 bg-white/5 px-2 py-0.5 rounded-md mt-0.5">
                    {report.cacheStats.hash.slice(0, 16)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {/* Exams count */}
              <Card className="border-border shadow-xs rounded-2xl bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Exams Taken</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-foreground">{report.metrics.examsCount}</span>
                    <TrendingUp size={20} className="text-muted-foreground/70" />
                  </div>
                </CardContent>
              </Card>

              {/* Average Score */}
              <Card className="border-border shadow-xs rounded-2xl bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-foreground">{report.metrics.avgScore}%</span>
                    <TrendingUp size={20} className={report.metrics.avgScore >= 75 ? "text-emerald-500" : "text-amber-500"} />
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy */}
              <Card className="border-border shadow-xs rounded-2xl bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Avg Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-foreground">{report.metrics.avgAccuracy}%</span>
                    <TrendingUp size={20} className={report.metrics.avgAccuracy >= 75 ? "text-emerald-500" : "text-amber-500"} />
                  </div>
                </CardContent>
              </Card>

              {/* Lessons */}
              <Card className="border-border shadow-xs rounded-2xl bg-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Lessons Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-foreground">{report.metrics.lessonsCompleted}</span>
                    <CheckCircle size={20} className="text-muted-foreground/70" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Mastery List & AI Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left Column: Subject Mastery */}
              <div className="lg:col-span-1 bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BookOpen size={14} className="text-primary" />
                  Curriculum Mastery
                </h3>

                {report.metrics.mastery.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic font-medium py-6 text-center">No syllabus metrics recorded.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {report.metrics.mastery.map((m: any, index: number) => (
                      <div key={index} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold text-foreground">
                          <span className="capitalize">{m.subject}</span>
                          <span>{m.proficiency}%</span>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/50">
                          <div 
                            className={`h-full rounded-full ${
                              m.proficiency >= 75 
                                ? "bg-emerald-500" 
                                : m.proficiency >= 55 
                                  ? "bg-amber-500" 
                                  : "bg-primary"
                            }`} 
                            style={{ width: `${m.proficiency}%` }}
                          />
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                          Status: {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: AI Analytics Panel */}
              <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-xs flex flex-col gap-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" />
                  AI Performance Insights
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Strong areas */}
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                    <h4 className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <TrendingUp size={13} />
                      Academic Strength Vectors
                    </h4>
                    <ul className="text-xs font-medium text-foreground space-y-1.5">
                      {report.aiInsights.strongAreas.map((area: any, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5"></span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weak areas */}
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                    <h4 className="text-[10px] font-extrabold text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1">
                      <TrendingDown size={13} />
                      Vulnerability Risks
                    </h4>
                    <ul className="text-xs font-medium text-foreground space-y-1.5">
                      {report.aiInsights.weakAreas.map((area: any, i: number) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0 mt-1.5"></span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-muted/40 border border-border rounded-2xl">
                  <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <TrendingUp size={13} className="text-primary" />
                    Remedial Recommendations
                  </h4>
                  <ul className="text-xs font-medium text-foreground space-y-2">
                    {report.aiInsights.recommendations.map((rec: any, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <ArrowRight size={12} className="text-primary shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Study plan */}
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex flex-col gap-2">
                  <h4 className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={13} />
                    Personalized Practice Schedule
                  </h4>
                  <p className="text-xs font-medium text-foreground leading-relaxed">
                    {report.aiInsights.studyPlan}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}