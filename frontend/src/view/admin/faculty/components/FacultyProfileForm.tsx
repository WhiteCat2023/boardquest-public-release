import { IdCard, User, Mail, Phone, Briefcase, BookOpen, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Department, CreateFacultyPayload } from "../types";
import { useCategories } from "../hooks/useFaculty";

interface FacultyProfileFormProps {
  formData: CreateFacultyPayload;
  departments: Department[];
  isDepartmentsLoading: boolean;
  onChange: (field: keyof CreateFacultyPayload, value: string) => void;
  onCategoryChange: (categoryIds: string[]) => void;
}

export default function FacultyProfileForm({
  formData,
  departments,
  isDepartmentsLoading,
  onChange,
  onCategoryChange,
}: FacultyProfileFormProps) {
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
          <IdCard size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">Employee Profile & Department</h2>
          <p className="text-xs text-slate-400">Basic identification details, department, and assigned subjects</p>
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
            <Select
              value={formData.departmentId}
              onValueChange={(value) => onChange("departmentId", value)}
            >
              <SelectTrigger className="w-full h-11 px-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm text-slate-700 font-medium">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                {departments.length === 0 ? (
                  <div className="p-3 text-xs text-slate-400 text-center font-medium">
                    No departments found. Please create a department first.
                  </div>
                ) : (
                  departments.map((dept) => (
                    <SelectItem
                      key={dept.id}
                      value={dept.id}
                      className="cursor-pointer text-sm font-medium hover:bg-slate-50"
                    >
                      {dept.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Handled Subjects / Categories */}
        <div className="flex flex-col gap-2.5 md:col-span-2 pt-3 border-t border-slate-100">
          <Label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-slate-400" />
            Handled Subjects / Categories
          </Label>
          <p className="text-xs text-slate-400 -mt-1">
            Assign multiple subject categories handled by this faculty member.
          </p>
          {isCategoriesLoading ? (
            <div className="h-11 bg-slate-100 rounded-xl animate-pulse" />
          ) : categories.length === 0 ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-400 italic">
              No categories created yet in system.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.map((cat: any) => {
                const selectedIds = formData.handledCategoryIds || [];
                const isSelected = selectedIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const next = isSelected
                        ? selectedIds.filter((id) => id !== cat.id)
                        : [...selectedIds, cat.id];
                      onCategoryChange(next);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                      isSelected
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <Check size={12} className="stroke-[3]" />}
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
