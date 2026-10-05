import { useState, useEffect } from "react";
import { Bell, ShieldCheck, Globe, Send, Loader2, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useProfileMutations } from "../api/useProfileMutations";

export default function NotificationSettingsCard() {
  const {
    user,
    updateNotificationPreferences,
    sendTestDigest,
    isUpdatingPreferences,
    isSendingTestDigest,
  } = useProfileMutations();

  const userPrefs = (user as any)?.notificationPreferences;

  const [emailNotifications, setEmailNotifications] = useState(
    userPrefs?.emailNotifications ?? true,
  );
  const [securityAlerts, setSecurityAlerts] = useState(
    userPrefs?.securityAlerts ?? true,
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    userPrefs?.weeklyDigest ?? false,
  );

  // Sync state whenever user profile preferences are loaded or updated
  useEffect(() => {
    if (userPrefs) {
      if (userPrefs.emailNotifications !== undefined) {
        setEmailNotifications(Boolean(userPrefs.emailNotifications));
      }
      if (userPrefs.securityAlerts !== undefined) {
        setSecurityAlerts(Boolean(userPrefs.securityAlerts));
      }
      if (userPrefs.weeklyDigest !== undefined) {
        setWeeklyDigest(Boolean(userPrefs.weeklyDigest));
      }
    }
  }, [userPrefs]);

  const handleToggleEmailNotifications = async (checked: boolean) => {
    setEmailNotifications(checked);
    const success = await updateNotificationPreferences({
      emailNotifications: checked,
    });
    if (success) {
      toast.success(
        checked
          ? "Email notifications enabled for question approvals & alerts."
          : "Email notifications disabled.",
      );
    } else {
      // Revert if request failed
      setEmailNotifications(!checked);
    }
  };

  const handleToggleSecurityAlerts = async (checked: boolean) => {
    setSecurityAlerts(checked);
    const success = await updateNotificationPreferences({
      securityAlerts: checked,
    });
    if (success) {
      toast.success(
        checked
          ? "Security & login alerts enabled."
          : "Security & login alerts disabled.",
      );
    } else {
      // Revert if request failed
      setSecurityAlerts(!checked);
    }
  };

  const handleToggleWeeklyDigest = async (checked: boolean) => {
    setWeeklyDigest(checked);
    const success = await updateNotificationPreferences({
      weeklyDigest: checked,
    });
    if (success) {
      toast.success(
        checked
          ? "Weekly performance digest enabled."
          : "Weekly performance digest disabled.",
      );
    } else {
      // Revert if request failed
      setWeeklyDigest(!checked);
    }
  };

  const handleSendTestDigest = async () => {
    await sendTestDigest();
  };

  const recipientEmail = (user as any)?.email;

  return (
    <Card
      id="notifications"
      className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden scroll-mt-6 font-sans"
    >
      <CardHeader className="border-b border-border py-3.5 px-4 md:px-5 bg-card flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <CardTitle className="text-sm font-bold text-foreground">
            Notification Preferences
          </CardTitle>
        </div>

        {recipientEmail && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-full border border-border">
            <Mail size={12} className="text-primary" />
            <span className="truncate max-w-[200px]">{recipientEmail}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4 md:p-5 flex flex-col gap-3">
        {/* Email Notifications Toggle */}
        <div className="flex items-center justify-between p-3.5 px-4 bg-muted/20 hover:bg-muted/30 border border-border rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Bell size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground block">
                  Email Notifications
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    emailNotifications
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {emailNotifications ? "Active" : "Off"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Alerts for question approvals, revisions, & review comments.
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="pref-email-notifications"
              checked={emailNotifications}
              disabled={isUpdatingPreferences}
              onChange={(e) => handleToggleEmailNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Security & Login Alerts Toggle */}
        <div className="flex items-center justify-between p-3.5 px-4 bg-muted/20 hover:bg-muted/30 border border-border rounded-xl transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <ShieldCheck size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground block">
                  Security & Login Alerts
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    securityAlerts
                      ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                      : "bg-muted text-muted-foreground border border-border"
                  }`}
                >
                  {securityAlerts ? "Active" : "Off"}
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Security emails when your account is accessed from new sessions.
              </span>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="pref-security-alerts"
              checked={securityAlerts}
              disabled={isUpdatingPreferences}
              onChange={(e) => handleToggleSecurityAlerts(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Weekly Performance Digest Toggle */}
        <div className="flex flex-col gap-2 p-3.5 px-4 bg-muted/20 hover:bg-muted/30 border border-border rounded-xl transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
                <Globe size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground block">
                    Weekly Performance Digest
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      weeklyDigest
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {weeklyDigest ? "Subscribed" : "Off"}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Summary email of faculty question authoring and student review activity.
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                id="pref-weekly-digest"
                checked={weeklyDigest}
                disabled={isUpdatingPreferences}
                onChange={(e) => handleToggleWeeklyDigest(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Test Digest Dispatch Option */}
          <div className="mt-1 pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">
              Sent automatically every Monday morning.
            </span>
            <button
              type="button"
              id="btn-send-test-digest"
              onClick={handleSendTestDigest}
              disabled={isSendingTestDigest}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-lg text-foreground hover:bg-muted/60 border border-border transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSendingTestDigest ? (
                <>
                  <Loader2 size={12} className="animate-spin text-primary" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send size={12} className="text-primary" />
                  <span>Send Test Digest</span>
                </>
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
