import { useState } from "react";
import { Bell, ShieldCheck, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function NotificationSettingsCard() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <Card id="notifications" className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border py-3 px-4 md:px-5 bg-card">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          Notification Preferences
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 md:p-5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between p-3 px-3.5 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Bell size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Email Notifications</span>
              <span className="text-[11px] text-muted-foreground">Alerts for question approvals & system updates.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => {
              setEmailNotifications(e.target.checked);
              toast.info(`Email notifications ${e.target.checked ? "enabled" : "disabled"}`);
            }}
            className="h-4 w-4 accent-primary rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 px-3.5 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <ShieldCheck size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Security & Login Alerts</span>
              <span className="text-[11px] text-muted-foreground">Alerts for logins from new devices.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={securityAlerts}
            onChange={(e) => {
              setSecurityAlerts(e.target.checked);
              toast.info(`Security alerts ${e.target.checked ? "enabled" : "disabled"}`);
            }}
            className="h-4 w-4 accent-primary rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-3 px-3.5 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Globe size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Weekly Performance Digest</span>
              <span className="text-[11px] text-muted-foreground">Summary email of faculty and student review activity.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={weeklyDigest}
            onChange={(e) => {
              setWeeklyDigest(e.target.checked);
              toast.info(`Weekly digest ${e.target.checked ? "enabled" : "disabled"}`);
            }}
            className="h-4 w-4 accent-primary rounded cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
}
