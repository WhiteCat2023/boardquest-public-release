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
    <div className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 font-sans text-foreground">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2 bg-muted text-muted-foreground rounded-xl">
          <IdCard size={18} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Employee Profile & Department</h2>
          <p className="text-xs text-muted-foreground">Basic identification details, department, and assigned subjects</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Employee ID */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <IdCard size={14} className="text-muted-foreground" />
            Employee ID <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. EMP-2024-0102"
            value={formData.employeeId}
            onChange={(e) => onChange("employeeId", e.target.value)}
            className="h-11 bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Full Name */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-muted-foreground" />
            Full Name <span className="text-primary">*</span>
          </Label>
          <Input
            type="text"
            required
            placeholder="e.g. Dr. Jane Doe"
            value={formData.name}
            onChange={(e) => onChange("name", e.target.value)}
            className="h-11 bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Mail size={14} className="text-muted-foreground" />
            Email Address <span className="text-primary">*</span>
          </Label>
          <Input
            type="email"
            required
            placeholder="e.g. jdoe@university.edu"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            className="h-11 bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Phone Number */}
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Phone size={14} className="text-muted-foreground" />
            Phone Number <span className="text-primary">*</span>
          </Label>
          <Input
            type="tel"
            required
            placeholder="e.g. 09171234567"
            value={formData.phoneNumber}
            onChange={(e) => onChange("phoneNumber", e.target.value)}
            className="h-11 bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
          />
        </div>

        {/* Department */}
        <div className="flex flex-col gap-2 md:col-span-2">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase size={14} className="text-muted-foreground" />
            Department <span className="text-primary">*</span>
          </Label>
          {isDepartmentsLoading ? (
            <div className="h-11 bg-muted rounded-xl animate-pulse" />
          ) : (
            <Select
              value={formData.departmentId}
              onValueChange={(value) => onChange("departmentId", value)}
            >
              <SelectTrigger className="w-full h-11 px-3.5 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-sm text-foreground font-medium">
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border rounded-xl shadow-lg z-50 text-popover-foreground">
                {departments.length === 0 ? (
                  <div className="p-3 text-xs text-muted-foreground text-center font-medium">
                    No departments found. Please create a department first.
                  </div>
                ) : (
                  departments.map((dept) => (
                    <SelectItem
                      key={dept.id}
                      value={dept.id}
                      className="cursor-pointer text-sm font-medium hover:bg-accent"
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
        <div className="flex flex-col gap-2.5 md:col-span-2 pt-3 border-t border-border">
          <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen size={14} className="text-muted-foreground" />
            Handled Subjects / Categories
          </Label>
          <p className="text-xs text-muted-foreground -mt-1">
            Assign multiple subject categories handled by this faculty member.
          </p>
          {isCategoriesLoading ? (
            <div className="h-11 bg-muted rounded-xl animate-pulse" />
          ) : categories.length === 0 ? (
            <div className="p-3.5 bg-muted/40 border border-border rounded-xl text-xs text-muted-foreground italic">
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
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-muted border-border text-muted-foreground hover:bg-accent hover:text-foreground"
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
