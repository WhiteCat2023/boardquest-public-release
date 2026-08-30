import { Building2, Mail, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";

export function SettingsPage() {
  const { user } = useReviewCenterAuth();

  return (
    <div className="space-y-6 max-w-4xl w-full mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Portal & Organization Settings
        </h1>
        <p className="text-xs text-muted-foreground">
          View your partner review center profile, representative credentials, and connection details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Representative Profile Card */}
        <Card className="rounded-3xl border-border bg-card shadow-2xs">
          <CardHeader className="pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <User className="size-4 text-primary" /> Representative Information
                </CardTitle>
                <CardDescription>
                  Your authenticated partner representative account.
                </CardDescription>
              </div>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                ACTIVE
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Full Name
                </span>
                <span className="font-bold text-foreground text-sm">
                  {user?.name || "Representative"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Employee ID / Ref
                </span>
                <span className="font-mono font-bold text-primary text-sm">
                  {user?.employeeId || "RC-REPRESENTATIVE"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Email Address
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <Mail className="size-3.5 text-primary" /> {user?.email}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Role Authority
                </span>
                <span className="font-bold text-foreground">
                  Review Center Partner (External)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partner Center Details */}
        <Card className="rounded-3xl border-border bg-card shadow-2xs">
          <CardHeader className="pb-4 border-b border-border">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="size-4 text-primary" /> Partner Organization
            </CardTitle>
            <CardDescription>
              Registered review center institution on the BoardQuest network.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Company / Organization Name
                </span>
                <span className="font-bold text-foreground text-sm">
                  {user?.companyName || user?.reviewCenter?.name || "Review Center"}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-1">
                  Headquarters Location
                </span>
                <span className="font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" /> {user?.location || "Philippines"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default SettingsPage;
