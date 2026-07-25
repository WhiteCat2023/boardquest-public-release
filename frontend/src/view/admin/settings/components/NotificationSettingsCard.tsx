import { useState } from "react";
import { Bell, ShieldCheck, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function NotificationSettingsCard() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  return (
    <Card id="notifications" className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border pb-4 pt-6 px-6 bg-card">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <Bell size={18} className="text-primary" />
          Notification Preferences
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure how and when you receive system alerts and security notifications.
        </p>
      </CardHeader>

      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-2xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground flex items-center gap-2">
              <Bell size={15} className="text-primary" /> Email Notifications
            </span>
            <span className="text-xs text-muted-foreground">
              Receive email alerts for question approvals and system changes.
            </span>
          </div>
          <input
            type="checkbox"
            checked={emailNotifications}
            onChange={(e) => {
              setEmailNotifications(e.target.checked);
              toast.info(`Email notifications ${e.target.checked ? "enabled" : "disabled"}`);
            }}
            className="h-5 w-5 accent-primary rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-2xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck size={15} className="text-primary" /> Security & Login Alerts
            </span>
            <span className="text-xs text-muted-foreground">
              Get notified whenever logins from new devices occur.
            </span>
          </div>
          <input
            type="checkbox"
            checked={securityAlerts}
            onChange={(e) => {
              setSecurityAlerts(e.target.checked);
              toast.info(`Security alerts ${e.target.checked ? "enabled" : "disabled"}`);
            }}
            className="h-5 w-5 accent-primary rounded cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/40 border border-border rounded-2xl">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe size={15} className="text-primary" /> Weekly Performance Digest
            </span>
            <span className="text-xs text-muted-foreground">
              Summary email of faculty and student review activity.
            </span>
          </div>
          <input
            type="checkbox"
            checked={weeklyDigest}
            onChange={(e) => {
              setWeeklyDigest(e.target.checked);
              toast.info(`Weekly digest ${e.target.checked ? "enabled" : "disabled"}`);
            }}
            className="h-5 w-5 accent-primary rounded cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
}
