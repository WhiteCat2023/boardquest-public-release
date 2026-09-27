import { useState, useEffect } from "react";
import { User, Mail, Phone, IdCard, Pencil, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { UpdateProfileParams } from "../../api/useProfileMutations";

interface PersonalDetailsTabProps {
  user: any;
  isSaving: boolean;
  onUpdateProfile: (data: UpdateProfileParams) => Promise<boolean>;
}

export function PersonalDetailsTab({
  user,
  isSaving,
  onUpdateProfile,
}: PersonalDetailsTabProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber || "");
  const [employeeId, setEmployeeId] = useState(user.employeeId || "");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (user.name) setName(user.name);
    if (user.email) setEmail(user.email);
    if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
    if (user.employeeId) setEmployeeId(user.employeeId);
  }, [user.name, user.email, user.phoneNumber, user.employeeId]);

  const handleCancelEdit = () => {
    setName(user.name || "");
    setEmail(user.email || "");
    setPhoneNumber(user.phoneNumber || "");
    setEmployeeId(user.employeeId || "");
    setIsEditingProfile(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onUpdateProfile({
      name,
      email,
      phoneNumber,
      employeeId,
    });
    if (success) {
      setIsEditingProfile(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
      {!isEditingProfile ? (
        /* VIEW MODE: EXACT RECREATION OF USER'S REFERENCE COMPONENT STYLE */
        <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 md:p-8 flex flex-col gap-6">
            {/* Header with Title and Pencil Edit Icon */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                Personal information
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Edit personal information"
              >
                <Pencil size={16} />
              </button>
            </div>

            {/* 2-Column Key-Value Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8 sm:gap-x-12">
              {/* Row 1 */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Full name</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {name || user.name || "Jane Doe"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Phone number</span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  {phoneNumber || user.phoneNumber || "09155019554"}
                </span>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Identity document</span>
                <span className="text-sm font-semibold text-foreground font-mono">
                  {employeeId || user.employeeId || "a-123-324"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Location</span>
                <span className="text-sm font-semibold text-foreground">
                  {user.location || "Philippines"}
                </span>
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Assigned role</span>
                <span className="text-sm font-semibold text-foreground capitalize">
                  {user.role ? String(user.role).toLowerCase() : "Teamlead"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Account status</span>
                <span className="text-sm font-semibold text-foreground">
                  Active
                </span>
              </div>

              {/* Row 4 */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Email</span>
                <span className="text-sm font-semibold text-foreground break-all">
                  {email || user.email || "denniscanaya2023@gmail.com"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-normal text-muted-foreground">Administrative scope</span>
                <span className="text-sm font-semibold text-foreground">
                  Review Centers &amp; Portals
                </span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        /* EDIT MODE: CLEAN FORM TO UPDATE DATA */
        <Card className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border pb-4 pt-5 px-5 sm:px-6 bg-card flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Edit personal information
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update your primary display credentials, email contact, and institutional phone line.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCancelEdit}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={15} className="mr-1" /> Cancel
            </Button>
          </CardHeader>

          <CardContent className="p-5 sm:p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User size={12} className="text-primary" /> Full Name <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                      required
                    />
                  </div>
                  <span className="text-[10.5px] text-muted-foreground">
                    Displayed on administrative audit logs and candidate feedback.
                  </span>
                </div>

                {/* Employee ID */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard size={12} className="text-indigo-500" /> Identity Document (Employee ID)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="e.g. a-123-324"
                      className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium font-mono"
                    />
                  </div>
                  <span className="text-[10.5px] text-muted-foreground">
                    Assigned institutional badge identifier.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail size={12} className="text-primary" /> Email Address <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium"
                      required
                    />
                  </div>
                  <span className="text-[10.5px] text-muted-foreground font-medium">
                    Used for portal sign-in, password reset, and security notifications.
                  </span>
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Phone size={12} className="text-primary" /> Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="e.g. +63 917 123 4567"
                      className="w-full h-10 px-3.5 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all font-medium font-mono"
                    />
                  </div>
                  <span className="text-[10.5px] text-muted-foreground">
                    Emergency mobile line for institutional critical alerts.
                  </span>
                </div>
              </div>

              {/* Submission Row */}
              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-border mt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="h-10 px-4 rounded-xl text-xs font-bold border-border cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
