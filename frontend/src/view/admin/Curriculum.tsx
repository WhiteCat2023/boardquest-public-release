import { useState } from "react";
import { BookOpenCheck, Search, Plus, Layers, BookMarked, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CourseSubject {
  id: string;
  code: string;
  title: string;
  department: string;
  semester: string;
  credits: number;
  units: number;
}

const DUMMY_SUBJECTS: CourseSubject[] = [
  {
    id: "1",
    code: "MLS-301",
    title: "Clinical Chemistry I",
    department: "Department of Medical Technology",
    semester: "First Semester",
    credits: 4,
    units: 4,
  },
  {
    id: "2",
    code: "MLS-302",
    title: "Diagnostic Microbiology",
    department: "Department of Medical Technology",
    semester: "First Semester",
    credits: 5,
    units: 5,
  },
  {
    id: "3",
    code: "MLS-303",
    title: "Hematology & Coagulation",
    department: "Department of Medical Technology",
    semester: "Second Semester",
    credits: 4,
    units: 4,
  },
  {
    id: "4",
    code: "MLS-401",
    title: "Immunology & Serology",
    department: "Department of Medical Technology",
    semester: "Second Semester",
    credits: 3,
    units: 3,
  },
];

export default function Curriculum() {
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects] = useState<CourseSubject[]>(DUMMY_SUBJECTS);

  const filteredSubjects = subjects.filter(
    (s) =>
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-4 -mt-4 z-10 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <BookOpenCheck size={22} className="stroke-[2.5]" />
            </div>
            Curriculum Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse course syllabi, subject benchmarks, and evaluation frameworks.
          </p>
        </div>

        <Button className="bg-[#A70202] text-white hover:bg-[#8e0202] rounded-xl px-5 h-11 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs">
          <Plus size={16} />
          Add Course Subject
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
        <Input
          type="text"
          placeholder="Search curriculum by course code or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202]"
        />
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubjects.map((sub) => (
          <Card
            key={sub.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 group-hover:scale-105 transition-transform">
                  <BookMarked size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                      {sub.code}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-slate-500 border-slate-200">
                      {sub.semester}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-slate-800 text-base mt-1 group-hover:text-indigo-600 transition-colors">
                    {sub.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">{sub.department}</span>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-bold">{sub.units} Units</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
