import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { ArrowLeft, UserPlus, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserRole } from "@/types/question";
import type { RoleType, CreateFacultyPayload } from "./types";
import { getAllowedRolesToCreate } from "./utils/facultyUtils";
import { useDepartments, useCreateFaculty } from "./hooks/useFaculty";
import FacultyProfileForm from "./components/FacultyProfileForm";
import FacultyAccountForm from "./components/FacultyAccountForm";
import FacultyRoleSelector from "./components/FacultyRoleSelector";

export default function AddFacultyMember() {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const currentUserRole = (auth as any)?.data?.user?.role as RoleType;

  // Form State
  const [formData, setFormData] = useState<CreateFacultyPayload>({
    employeeId: "",
    name: "",
    email: "",
    username: "",
    password: "",
    phoneNumber: "",
    departmentId: "",
    role: UserRole.TEACHER as RoleType,
  });

  const [errorMsg, setErrorMsg] = useState("");

  // Queries & Mutations
  const { data: departments = [], isLoading: isDepartmentsLoading } = useDepartments();
  const createMutation = useCreateFaculty();

  // Set default department when loaded
  useEffect(() => {
    if (departments.length > 0 && !formData.departmentId) {
      setFormData((prev) => ({ ...prev, departmentId: departments[0].id }));
    }
  }, [departments]);

  // Set default role based on current user permissions
  useEffect(() => {
    if (currentUserRole === UserRole.SUPERADMIN) {
      setFormData((prev) => ({ ...prev, role: UserRole.ADMIN }));
    } else if (currentUserRole === UserRole.ADMIN) {
      setFormData((prev) => ({ ...prev, role: UserRole.TEAMLEAD }));
    } else {
      setFormData((prev) => ({ ...prev, role: UserRole.TEACHER }));
    }
  }, [currentUserRole]);

  const allowedRoles = getAllowedRolesToCreate(currentUserRole);

  const handleFieldChange = (field: keyof CreateFacultyPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.departmentId) {
      setErrorMsg("Please select a department.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    createMutation.mutate(formData, {
      onSuccess: () => {
        toast.success("Faculty member registered successfully!");
        navigate("/faculty-management");
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || "Failed to register faculty member.";
        setErrorMsg(msg);
        toast.error(msg);
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50 max-w-5xl mx-auto">
      {/* Header & Back Navigation */}
      <div className="flex flex-col gap-4 sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-4 -mt-4 z-10 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Link
            to="/faculty-management"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#A70202] transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Faculty Directory
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
              <div className="p-2.5 bg-red-50 text-[#A70202] rounded-2xl border border-red-100">
                <UserPlus size={22} className="stroke-[2.5]" />
              </div>
              Add New Faculty Member
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Create a new account for an instructor, course coordinator, or administrator.
            </p>
          </div>
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {errorMsg && (
          <div className="flex items-center gap-3 p-4 bg-red-50 text-[#A70202] border border-red-200 rounded-2xl text-xs font-semibold animate-in fade-in duration-200">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modular Form Cards */}
        <FacultyProfileForm
          formData={formData}
          departments={departments}
          isDepartmentsLoading={isDepartmentsLoading}
          onChange={handleFieldChange}
          onCategoryChange={(categoryIds) => setFormData((prev) => ({ ...prev, handledCategoryIds: categoryIds }))}
        />

        <FacultyAccountForm
          formData={formData}
          onChange={handleFieldChange}
        />

        <FacultyRoleSelector
          selectedRole={formData.role}
          allowedRoles={allowedRoles}
          onSelectRole={(role) => handleFieldChange("role", role)}
        />

        {/* Actions Bar */}
        <div className="flex items-center justify-end gap-4 pt-4 pb-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/faculty-management")}
            disabled={createMutation.isPending}
            className="cursor-pointer border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold px-6 py-2.5 rounded-xl h-11"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-[#A70202] text-white hover:bg-[#8e0202] cursor-pointer font-semibold px-8 py-2.5 rounded-xl h-11 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : (
              <Sparkles size={16} />
            )}
            Register Faculty Account
          </Button>
        </div>
      </form>
    </div>
  );
}
