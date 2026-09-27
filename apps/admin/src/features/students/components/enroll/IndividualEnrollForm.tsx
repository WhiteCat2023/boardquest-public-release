import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, Mail, User, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreateStudent } from "@/features/students";

export function IndividualEnrollForm() {
  const navigate = useNavigate();
  const createStudentMutation = useCreateStudent();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "Philippines",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error("First Name and Last Name are required.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required.");
      return;
    }

    const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();

    createStudentMutation.mutate(
      {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: fullName,
        email: formData.email.trim(),
        location: formData.location.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Student account enrolled successfully! Login credentials sent to their email.");
          navigate("/student-management");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create student account.");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="bg-card border border-border/80 rounded-2xl p-4 md:p-6 shadow-xs flex flex-col gap-4 font-sans text-foreground">
        <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20">
            <UserPlus size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Student Identity & Account Details</h2>
            <p className="text-xs text-muted-foreground">
              Enter the student's name, email, and location. Login credentials will be generated automatically.
            </p>
          </div>
        </div>

        {/* Credential Dispatch Notice */}
        <div className="flex items-start gap-3 p-3.5 bg-primary/5 border border-primary/20 rounded-xl">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg shrink-0 mt-0.5">
            <Mail size={16} />
          </div>
          <div className="text-xs">
            <p className="font-bold text-foreground">Automatic Credential Generation & Dispatch</p>
            <p className="text-muted-foreground mt-0.5 leading-relaxed">
              A secure temporary password will be automatically generated upon enrollment and emailed directly to the student's email address.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-muted-foreground" />
              First Name <span className="text-primary">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g. Alexander"
              value={formData.firstName}
              onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User size={12} className="text-muted-foreground" />
              Last Name <span className="text-primary">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g. Wright"
              value={formData.lastName}
              onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={12} className="text-muted-foreground" />
              Email Address <span className="text-primary">*</span>
            </Label>
            <Input
              type="email"
              placeholder="e.g. alexander@student.university.edu"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
              required
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} className="text-muted-foreground" />
              Location / Region
            </Label>
            <Input
              type="text"
              placeholder="e.g. Philippines"
              value={formData.location}
              onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
              className="h-9 bg-muted/30 border-border/80 rounded-lg text-xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/student-management")}
          disabled={createStudentMutation.isPending}
          className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 py-2 rounded-lg h-9 text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createStudentMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2 rounded-lg h-9 text-xs shadow-xs transition-all flex items-center gap-1.5"
        >
          {createStudentMutation.isPending ? (
            <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-3.5 h-3.5" />
          ) : (
            <Sparkles size={14} />
          )}
          Enroll Student Account
        </Button>
      </div>
    </form>
  );
}
