import { IdCard, User, Mail, Phone, Briefcase } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Department, CreateFacultyPayload } from "../types";

interface FacultyProfileFormProps {
  formData: CreateFacultyPayload;
  departments: Department[];
  isDepartmentsLoading: boolean;
  onChange: (field: keyof CreateFacultyPayload, value: string) => void;
}

export default function FacultyProfileForm({
  formData,
  departments,
  isDepartmentsLoading,
  onChange,
}: FacultyProfileFormProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
          <IdCard size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Employee Profile & Department</h2>
          <p className="text-xs text-slate-400">Basic identification details and departmental assignment</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Employee ID */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <IdCard size={14} className="text-slate-400" />
            Employee ID <span className="text-[#A70202]">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. EMP-2024-0102"
            value={formData.employeeId}
            onChange={(e) => onChange("employeeId", e.target.value)}
            className="h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
          />
        </div>

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-slate-400" />
            Full Name <span className="text-[#A70202]">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. Dr. Jane Doe"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={14} className="text-slate-400" />
            Email Address <span className="text-[#A70202]">*</span>
          </Label>
          <Input
            type="email"
            required
            placeholder="e.g. jdoe@university.edu"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={14} className="text-slate-400" />
            Phone Number <span className="text-[#A70202]">*</span>
          </Label>
          <Input
            type="tel"
            required
            placeholder="e.g. 09171234567"
            value={formData.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            className="h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
          />
        </div>

        {/* Department */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase size={14} className="text-slate-400" />
            Department <span className="text-[#A70202]">*</span>
          </Label>
          {isDepartmentsLoading ? (
            <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
          ) : (
            <select
              value={formData.departmentId}
              onChange={(e) => onChange("departmentId", e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm text-slate-700 transition-all font-medium"
            >
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
