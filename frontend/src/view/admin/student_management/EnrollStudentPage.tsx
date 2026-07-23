import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, Mail, MapPin, KeyRound, Key, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useCreateStudent } from "./hooks/useStudent";

export default function EnrollStudentPage() {
  const navigate = useNavigate();
  const createMutation = useCreateStudent();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "Philippines",
    password: "",
    confirmPassword: "",
  });

  const handleGeneratePassword = () => {
    const randomPass = `BQ-STU-${Math.random().toString(36).substring(2, 6).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setFormData((prev) => ({
      ...prev,
      password: randomPass,
      confirmPassword: randomPass,
    }));
    toast.info(`Generated temporary password: ${randomPass}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and Email are required.");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    createMutation.mutate(
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      },
      {
        onSuccess: () => {
          toast.success("Student account enrolled successfully!");
          navigate("/student-management");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create student account.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl mx-auto animate-in fade-in duration-300 font-sans">
      {/* Back link */}
      <button
        onClick={() => navigate("/student-management")}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#A70202] transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        Back to Student Directory
      </button>

      <Card className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-0">
        {/* Header Bar */}
        <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-50 text-[#A70202] rounded-2xl border border-[#A70202]/10 shadow-xs">
              <UserPlus size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Enroll New Student
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Fill in the details below to create an individual student account.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Alexander Wright"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl text-sm focus:border-[#A70202]"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. alexander@student.university.edu"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl text-sm focus:border-[#A70202]"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
                Location / Region
              </label>
              <Input
                type="text"
                placeholder="e.g. Philippines"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl text-sm focus:border-[#A70202]"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between pl-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-[11px] font-semibold text-[#A70202] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={12} /> Auto-Generate
                </button>
              </div>
              <Input
                type="password"
                placeholder="Enter account password"
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl text-sm focus:border-[#A70202]"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                className="h-11 bg-slate-50/50 border-slate-200 rounded-xl text-sm focus:border-[#A70202]"
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/student-management")}
              className="rounded-xl border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 h-11 px-5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-[#A70202] hover:bg-[#8f0101] text-white rounded-xl text-xs font-semibold px-6 h-11 cursor-pointer flex items-center gap-2"
            >
              {createMutation.isPending ? "Enrolling Student..." : "Enroll Student Account"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
