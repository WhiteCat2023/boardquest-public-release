import { useState } from "react";
import { Award, BookOpen, BarChart3, TrendingUp, Users, CheckCircle2, FileSpreadsheet, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReviewCenterAssessments } from "../../api/useReviewCenter";
import type { ReviewCenterRepresentative } from "../../types/types";

interface ReviewCenterAssessmentsTabProps {
  reviewCenter?: ReviewCenterRepresentative | null;
}

const MEDTECH_SUBJECTS = [
  "Clinical Chemistry",
  "Microbiology & Parasitology",
  "Hematology",
  "Immunology & Serology and Immunohematology",
  "Clinical Microscopy & Parasitology",
  "Histopathology and Medtech Laws",
];

export default function ReviewCenterAssessmentsTab({
  reviewCenter,
}: ReviewCenterAssessmentsTabProps) {
  const [selectedSchoolYear, setSelectedSchoolYear] = useState("2026-2027");
  const [selectedSubject, setSelectedSubject] = useState("ALL");

  const { data, isLoading } = useReviewCenterAssessments(reviewCenter?.id, {
    schoolYear: selectedSchoolYear,
    subject: selectedSubject !== "ALL" ? selectedSubject : undefined,
  });

  const assessments = data?.assessments || [];
  const rows = data?.rows || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Filters Bar */}
      <div className="bg-card border border-border p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <Select value={selectedSchoolYear} onValueChange={setSelectedSchoolYear}>
            <SelectTrigger className="w-36 h-8 text-xs font-bold">
              <SelectValue placeholder="School Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2026-2027">2026-2027</SelectItem>
              <SelectItem value="2025-2026">2025-2026</SelectItem>
              <SelectItem value="2024-2025">2024-2025</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-56 h-8 text-xs font-bold">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All 6 MedTech Subjects</SelectItem>
              {MEDTECH_SUBJECTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
          <Award className="size-4 text-primary" />
          <span>Admin Assessment Monitoring</span>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="text-xs">Loading review center performance...</span>
        </div>
      ) : assessments.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card">
          <div className="p-3 bg-muted w-fit mx-auto rounded-full text-muted-foreground mb-3">
            <BarChart3 className="size-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No assessment data recorded</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            This review center has not uploaded any scores or assessments for this term.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Assessment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {assessments.map((a: any) => (
              <Card key={a.id} className="bg-card border-border">
                <CardContent className="p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] font-bold text-primary bg-primary/10">
                      {a.subject}
                    </Badge>
                    {a.customLabel && (
                      <Badge variant="outline" className="text-[9px]">
                        {a.customLabel}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground truncate">{a.title}</h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Max: {a.maxScore} pts • Passing: {a.passingScore} pts ({a.passingRate}%)
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2 grid grid-cols-3 gap-1 text-center text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Mean</span>
                      <p className="font-extrabold text-foreground">{a.meanScore?.toFixed(0) ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Median</span>
                      <p className="font-extrabold text-foreground">{a.medianScore?.toFixed(0) ?? "—"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-muted-foreground">Pass / Fail</span>
                      <p className="font-extrabold text-foreground">
                        <span className="text-green-600">{a.passCount}</span> / <span className="text-red-500">{a.failCount}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Performance Roster Matrix */}
          <div className="border border-border rounded-xl bg-card overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/40 font-bold text-xs flex items-center justify-between">
              <span>Candidate Assessment Performance ({rows.length} students)</span>
              <span className="text-muted-foreground font-normal">Auto-calculated from uploaded sheets</span>
            </div>
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-muted/60 sticky top-0 border-b border-border text-[11px] font-bold text-muted-foreground">
                  <tr>
                    <th className="p-2.5">Candidate</th>
                    {assessments.map((a: any) => (
                      <th key={a.id} className="p-2.5 text-center truncate max-w-[130px]" title={a.title}>
                        {a.title}
                      </th>
                    ))}
                    <th className="p-2.5 text-center">Average %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r: any) => (
                    <tr key={r.candidate.id} className="hover:bg-muted/20">
                      <td className="p-2.5 font-medium">
                        <div>{r.candidate.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{r.candidate.schoolId || r.candidate.email}</div>
                      </td>
                      {assessments.map((a: any) => {
                        const scoreObj = r.scores[a.id];
                        return (
                          <td key={a.id} className="p-2.5 text-center font-mono">
                            {scoreObj?.status === "PRESENT" && scoreObj?.score !== null ? (
                              <span className={scoreObj.score >= a.passingScore ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                                {scoreObj.score}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic text-[10px]">{scoreObj?.status || "—"}</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="p-2.5 text-center font-bold">
                        {r.summary.overallPercentage !== null ? (
                          <Badge variant={r.summary.isPassing ? "outline" : "destructive"} className="text-[10px]">
                            {r.summary.overallPercentage.toFixed(1)}%
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
