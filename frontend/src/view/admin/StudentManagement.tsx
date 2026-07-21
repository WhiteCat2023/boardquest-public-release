import { useState } from "react";
import { GraduationCap, Search, UserPlus, Mail, Phone, BookOpen, CheckCircle2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  program: string;
  yearLevel: string;
  status: "ACTIVE" | "INACTIVE";
  enrolledCourses: number;
}

const DUMMY_STUDENTS: Student[] = [
  {
    id: "1",
    studentId: "STU-2024-001",
    name: "Alexander Wright",
    email: "awright@student.university.edu",
    program: "BS Medical Laboratory Science",
    yearLevel: "3rd Year",
    status: "ACTIVE",
    enrolledCourses: 5,
  },
  {
    id: "2",
    studentId: "STU-2024-002",
    name: "Beatriz Santos",
    email: "bsantos@student.university.edu",
    program: "BS Nursing",
    yearLevel: "4th Year",
    status: "ACTIVE",
    enrolledCourses: 6,
  },
  {
    id: "3",
    studentId: "STU-2024-003",
    name: "Carlos Reyes",
    email: "creyes@student.university.edu",
    program: "BS Medical Technology",
    yearLevel: "2nd Year",
    status: "ACTIVE",
    enrolledCourses: 4,
  },
  {
    id: "4",
    studentId: "STU-2024-004",
    name: "Diana Mendoza",
    email: "dmendoza@student.university.edu",
    program: "BS Pharmacy",
    yearLevel: "1st Year",
    status: "ACTIVE",
    enrolledCourses: 5,
  },
];

export default function StudentManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students] = useState<Student[]>(DUMMY_STUDENTS);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-4 -mt-4 z-10 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
              <GraduationCap size={22} className="stroke-[2.5]" />
            </div>
            Student Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage enrolled students, academic programs, and evaluation eligibility.
          </p>
        </div>

        <Button className="bg-[#A70202] text-white hover:bg-[#8e0202] rounded-xl px-5 h-11 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs">
          <UserPlus size={16} />
          Enroll New Student
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder="Search students by name, ID, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202]"
          />
        </div>
        <Button variant="outline" className="h-11 border-slate-200 rounded-xl px-4 text-slate-600 flex items-center gap-2 font-semibold">
          <Filter size={15} />
          Filter
        </Button>
      </div>

      {/* Student Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredStudents.map((student) => (
          <Card
            key={student.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-slate-200 bg-indigo-50 text-indigo-700">
                  <AvatarFallback className="font-bold text-base bg-indigo-50 text-indigo-700">
                    {student.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{student.name}</h3>
                  <span className="text-xs font-semibold text-slate-400">
                    ID: {student.studentId}
                  </span>
                </div>
              </div>

              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5"
              >
                <CheckCircle2 size={11} className="mr-1 inline" />
                {student.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Program</span>
                <span className="font-semibold text-slate-700">{student.program}</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Year Level</span>
                <span className="font-semibold text-slate-700">{student.yearLevel}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-slate-400" />
                {student.email}
              </span>
              <span className="flex items-center gap-1.5 text-indigo-600 font-semibold">
                <BookOpen size={13} />
                {student.enrolledCourses} Courses Enrolled
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
