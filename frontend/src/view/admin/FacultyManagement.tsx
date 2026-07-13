import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  Users, 
  Plus, 
  Trash2, 
  Shield, 
  Briefcase, 
  Phone, 
  Mail, 
  UserPlus, 
  X, 
  AlertTriangle,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type RoleType = "SUPERADMIN" | "ADMIN" | "TEAMLEAD" | "TEACHER";

interface FacultyMember {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  username: string;
  role: RoleType;
  phoneNumber: string;
  departmentId: string;
  department: {
    id: string;
    name: string;
  };
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
}

export default function FacultyManagement() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  
  // Current user info
  const currentUserRole = (auth as any)?.data?.user?.role as RoleType;
  const currentUserId = (auth as any)?.data?.user?.id;

  // Form Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    username: "",
    password: "",
    phoneNumber: "",
    departmentId: "",
    role: "TEACHER" as RoleType,
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Queries
  const { data: faculties = [], isLoading: isFacultiesLoading } = useQuery<FacultyMember[]>({
    queryKey: ["faculties"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/faculty");
      return response.data?.data?.faculties ?? [];
    },
  });

  const { data: departments = [] } = useQuery<Department[]>({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/departments/get");
      return response.data?.data?.departments ?? [];
    },
  });

  // Set default department when loaded
  useEffect(() => {
    if (departments.length > 0 && !formData.departmentId) {
      setFormData(prev => ({ ...prev, departmentId: departments[0].id }));
    }
  }, [departments]);

  // Set default role based on current user permissions
  useEffect(() => {
    if (currentUserRole === "SUPERADMIN") {
      setFormData(prev => ({ ...prev, role: "ADMIN" }));
    } else if (currentUserRole === "ADMIN") {
      setFormData(prev => ({ ...prev, role: "TEAMLEAD" }));
    } else {
      setFormData(prev => ({ ...prev, role: "TEACHER" }));
    }
  }, [currentUserRole, isOpen]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await axiosPrivate.post("/faculty", data);
    },
    onSuccess: () => {
      setSuccessMsg("Faculty member registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
      setTimeout(() => {
        setIsOpen(false);
        setFormData({
          employeeId: "",
          name: "",
          email: "",
          username: "",
          password: "",
          phoneNumber: "",
          departmentId: departments[0]?.id || "",
          role: "TEACHER",
        });
        setSuccessMsg("");
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Failed to register faculty member.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await axiosPrivate.delete(`/faculty/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Failed to delete faculty member.");
    }
  });

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!formData.departmentId) {
      setErrorMsg("Please select a department.");
      return;
    }

    createMutation.mutate(formData);
  };

  const handleDelete = (id: string, memberName: string, memberRole: RoleType) => {
    if (id === currentUserId) {
      alert("You cannot delete your own account.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete ${memberName} (${memberRole})?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Roles filtering logic based on accessibility guidelines
  const getAllowedRolesToCreate = (): { value: RoleType; label: string }[] => {
    if (currentUserRole === "SUPERADMIN") {
      return [
        { value: "ADMIN", label: "Admin" },
        { value: "TEAMLEAD", label: "Co-Admin (Team Lead)" },
        { value: "TEACHER", label: "Teacher" },
      ];
    }
    if (currentUserRole === "ADMIN") {
      return [
        { value: "TEAMLEAD", label: "Co-Admin (Team Lead)" },
        { value: "TEACHER", label: "Teacher" },
      ];
    }
    if (currentUserRole === "TEAMLEAD") {
      return [
        { value: "TEACHER", label: "Teacher" },
      ];
    }
    return [];
  };

  const isAllowedToManageRole = (creatorRole: RoleType, targetRole: RoleType): boolean => {
    if (creatorRole === "SUPERADMIN") return true;
    if (creatorRole === "ADMIN") {
      // ADMIN can manage CO-ADMIN(TEAMLEAD) and TEACHER
      return targetRole === "TEAMLEAD" || targetRole === "TEACHER";
    }
    if (creatorRole === "TEAMLEAD") {
      // CO-ADMIN(TEAMLEAD) can manage TEACHERS
      return targetRole === "TEACHER";
    }
    return false;
  };

  const getRoleBadgeColor = (role: RoleType) => {
    switch (role) {
      case "SUPERADMIN": return "bg-red-50 text-red-700 border-red-200";
      case "ADMIN": return "bg-orange-50 text-orange-700 border-orange-200";
      case "TEAMLEAD": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "TEACHER": return "bg-green-50 text-green-700 border-green-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 border-b border-slate-100 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Users className="text-[#A70202]" />
            Faculty & Administrative Directory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage academic staff, course leads, and administrator privileges.
          </p>
        </div>

        {getAllowedRolesToCreate().length > 0 && (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-[#A70202] text-white hover:bg-[#8f0101] rounded-xl px-5 py-2.5 flex items-center gap-2 font-semibold shadow-sm transition-all duration-200 cursor-pointer"
          >
            <UserPlus size={16} />
            Add Faculty Member
          </Button>
        )}
      </div>

      {/* Directory Grid */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden w-full">
        {isFacultiesLoading ? (
          <div className="py-24 text-center text-slate-400">
            <div className="animate-spin inline-block border-3 border-[#A70202] border-t-transparent rounded-full w-8 h-8 mb-4"></div>
            <p className="text-sm font-medium">Fetching directory listings...</p>
          </div>
        ) : faculties.length === 0 ? (
          <div className="py-24 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Users size={48} className="text-slate-300 stroke-[1.5]" />
            <p className="font-bold text-slate-600">No Administrators Registered</p>
            <p className="text-sm max-w-sm">No administrators or teachers have been added to the system yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee Profile</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Details</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Scope / Department</th>
                  <th className="p-4 text-[10px] font-bold uppercase tracking-wider text-slate-400">Authority Role</th>
                  <th className="p-4 px-6 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {faculties.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/30 transition-colors group">
                    {/* Profile */}
                    <td className="p-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 uppercase border border-slate-200">
                          {member.name.slice(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{member.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ID: {member.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* Contact */}
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5 text-xs font-medium text-slate-500">
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {member.email}</span>
                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {member.phoneNumber}</span>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-xs font-semibold">
                        <Briefcase size={13} className="text-slate-400" />
                        <span className="capitalize">{member.department?.name || "General"}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${getRoleBadgeColor(member.role)}`}>
                        <Shield size={10} />
                        {member.role === "TEAMLEAD" ? "CO-ADMIN" : member.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 px-6 text-right">
                      {member.id !== currentUserId && isAllowedToManageRole(currentUserRole, member.role) ? (
                        <button
                          onClick={() => handleDelete(member.id, member.name, member.role)}
                          className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                          title="Delete Faculty Account"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span className="text-xs text-slate-300 font-semibold italic">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-[2rem] w-full max-w-xl p-8 shadow-2xl flex flex-col relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3.5 mb-6">
              <div className="p-3 bg-red-50 text-[#A70202] rounded-2xl border border-red-100">
                <UserCheck size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Register New Faculty Account</h3>
                <p className="text-xs text-slate-400 font-medium">Create a curriculum reviewer or course instructor profile</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-[#A70202] border border-red-100 rounded-xl text-xs font-semibold">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-semibold">
                  <UserCheck size={14} className="shrink-0 animate-bounce" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Employee ID</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="e.g. EMP-1092"
                    value={formData.employeeId} 
                    onChange={e => setFormData({ ...formData, employeeId: e.target.value })}
                    className="h-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="e.g. Dr. John Doe"
                    value={formData.name} 
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="h-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="name@university.edu"
                    value={formData.email} 
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="h-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <Input 
                    type="tel" 
                    required 
                    placeholder="0917XXXXXXX"
                    value={formData.phoneNumber} 
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="h-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Username</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="jdoe_admin"
                    value={formData.username} 
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="h-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Password</label>
                  <Input 
                    type="password" 
                    required 
                    placeholder="Min. 6 characters"
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="h-10 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 col-span-2">
                {/* Department Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={e => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm text-slate-700 transition-all duration-150"
                  >
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role selection - RESTRICTED */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Authority Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as RoleType })}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm text-slate-700 transition-all duration-150"
                  >
                    {getAllowedRolesToCreate().map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3.5 pt-4 border-t border-slate-100 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={createMutation.isPending}
                  className="cursor-pointer border-slate-200 hover:bg-slate-100 font-semibold px-5 py-2.5 rounded-xl h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-[#A70202] text-white hover:bg-[#8e0202] cursor-pointer font-semibold px-5 py-2.5 rounded-xl h-auto shadow-sm flex items-center gap-1.5"
                >
                  {createMutation.isPending ? (
                    <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Register Account
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}