import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MAJOR_SUBJECTS } from "../constants/subjects";
import appContent from "@/constants/appContent";

export function SubjectOverviewSection() {
  const sectionContent = appContent.dashboard.subjectOverview;

  return (
    <Card className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="text-[#A70202]" size={22} />
            {sectionContent.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {sectionContent.description}
          </p>
        </div>

        <Badge
          variant="outline"
          className="bg-slate-50 text-slate-600 border-slate-200 text-xs font-bold px-3 py-1 rounded-full w-fit"
        >
          {sectionContent.benchmarkBadge}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MAJOR_SUBJECTS.map((subj) => {
          const IconComp = subj.icon;
          return (
            <div
              key={subj.code}
              className="p-5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl border ${subj.color} shrink-0`}>
                  <IconComp size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {subj.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#A70202] transition-colors">
                    {subj.name}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">{sectionContent.proficiencyLabel}</span>
                  <span className="text-emerald-700 font-extrabold">{subj.proficiency}%</span>
                </div>

                <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${subj.barColor}`}
                    style={{ width: `${subj.proficiency}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
