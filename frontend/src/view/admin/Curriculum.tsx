import { useState } from "react";
import { BookOpenCheck, Search, Plus, BookMarked } from "lucide-react";
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
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 z-10 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/20">
              <BookOpenCheck size={22} className="stroke-[2.5]" />
            </div>
            Curriculum Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse course syllabi, subject benchmarks, and evaluation frameworks.
          </p>
        </div>

        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 h-11 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs">
          <Plus size={16} />
          Add Course Subject
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input
          type="text"
          placeholder="Search curriculum by course code or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 bg-card border border-border rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredSubjects.map((sub) => (
          <Card
            key={sub.id}
            className="bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20 group-hover:scale-105 transition-transform">
                  <BookMarked size={20} className="stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-md border border-indigo-500/20">
                      {sub.code}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-bold text-muted-foreground border-border">
                      {sub.semester}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-foreground text-base mt-1 group-hover:text-primary transition-colors">
                    {sub.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border text-xs">
              <span className="text-muted-foreground font-medium">{sub.department}</span>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{sub.units} Units</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
