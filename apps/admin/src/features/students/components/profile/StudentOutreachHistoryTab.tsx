import { Mail, Video, Clock, CheckCircle2, AlertTriangle, Send, Sparkles, BookOpen, ExternalLink, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Student } from "../../types/types";

interface StudentOutreachHistoryTabProps {
  student: Student;
  onReachOut?: () => void;
}

export function StudentOutreachHistoryTab({
  student,
  onReachOut,
}: StudentOutreachHistoryTabProps) {
  const outreachLogs: any[] = student.outreachLogs || [];
  const activeGuidance =
    student.activeGuidance ||
    (student.guidanceAssignments || []).find(
      (g: any) =>
        String(g.status).toUpperCase() === "PENDING" ||
        String(g.status).toUpperCase() === "IN_PROGRESS",
    );

  const formatRelativeDate = (dateStr?: string | Date | null) => {
    if (!dateStr) return "Never Contacted";
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Contacted Today";
    if (diffDays === 1) return "Contacted Yesterday";
    if (diffDays < 7) return `Contacted ${diffDays}d ago`;
    return `Last contact ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const getTemplateBadge = (templateType?: string) => {
    switch (templateType) {
      case "REMEDIAL":
        return (
          <Badge variant="outline" className="text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
            <AlertTriangle size={11} className="mr-1 inline" />
            Remediation Notice
          </Badge>
        );
      case "CONSULTATION":
        return (
          <Badge variant="outline" className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">
            <Calendar size={11} className="mr-1 inline" />
            1-on-1 Consultation
          </Badge>
        );
      case "COMMENDATION":
        return (
          <Badge variant="outline" className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            <Sparkles size={11} className="mr-1 inline" />
            Commendation
          </Badge>
        );
      case "CHECKIN":
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/20">
            <BookOpen size={11} className="mr-1 inline" />
            Study Plan Check-In
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Top Summary Banner */}
      <div className="bg-card border border-border rounded-2xl p-4.5 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="size-11 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <Mail size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">
                Faculty Advising & Communication Log
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold bg-muted/60 text-muted-foreground border-border">
                {outreachLogs.length} {outreachLogs.length === 1 ? "Message" : "Messages"} Sent
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatRelativeDate(student.lastContactedAt || outreachLogs[0]?.createdAt)}
              {activeGuidance?.advisor?.name ? ` &bull; Assigned Advisor: ${activeGuidance.advisor.name}` : ""}
            </p>
          </div>
        </div>

        {onReachOut && (
          <Button
            size="sm"
            onClick={onReachOut}
            className="h-8.5 px-3.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0 self-start md:self-auto"
          >
            <Send size={13} />
            <span>Send New Outreach Email</span>
          </Button>
        )}
      </div>

      {/* Communication Timeline List */}
      {outreachLogs.length === 0 ? (
        <div className="border border-border/80 rounded-2xl bg-card p-10 text-center flex flex-col items-center justify-center gap-3">
          <div className="size-12 rounded-2xl bg-muted/60 border border-border text-muted-foreground flex items-center justify-center">
            <Mail size={22} className="stroke-[1.5]" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-sm font-bold text-foreground">No Outreach Messages Sent Yet</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Use the outreach tool to send official guidance emails, check-ins, or consultation schedules to {student.name}.
            </p>
          </div>
          {onReachOut && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReachOut}
              className="mt-2 h-8 px-3.5 text-xs font-semibold rounded-xl border-primary/30 text-primary hover:bg-primary/10 cursor-pointer flex items-center gap-1.5"
            >
              <Send size={13} />
              <span>Reach Out Now</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {outreachLogs.map((log: any, idx: number) => {
            const advisorName = log.advisor?.name || "Advisor";
            const advisorRole = log.advisor?.role || "Faculty";
            const advisorEmail = log.advisor?.email || "";
            const formattedDate = new Date(log.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={log.id || idx}
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3.5 transition-all hover:border-border/80"
              >
                {/* Header: Sender & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-8 border border-border bg-muted">
                      <AvatarFallback className="font-bold text-[10px] uppercase bg-primary/10 text-primary">
                        {advisorName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">{advisorName}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">({advisorRole})</span>
                      </div>
                      {advisorEmail && (
                        <span className="text-[10.5px] text-muted-foreground">{advisorEmail}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {getTemplateBadge(log.templateType)}
                    <span className="text-[10.5px] text-muted-foreground flex items-center gap-1">
                      <Clock size={11} />
                      {formattedDate}
                    </span>
                  </div>
                </div>

                {/* Subject & Focus Subject Banner */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-foreground">
                      {log.subject}
                    </h4>
                    {log.focusSubject && (
                      <Badge variant="outline" className="text-[9.5px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/20">
                        Focus: {log.focusSubject}
                      </Badge>
                    )}
                  </div>

                  {/* Message Body */}
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-xs text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
                    {log.message}
                  </div>
                </div>

                {/* Meeting Link Callout (if present) */}
                {log.meetingLink && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Video size={14} className="text-blue-500 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                          Scheduled Consultation Link
                        </span>
                        <span className="text-[10.5px] text-muted-foreground truncate">
                          {log.meetingLink}
                        </span>
                      </div>
                    </div>
                    <a
                      href={log.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                    >
                      <span>Join Meeting</span>
                      <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                {/* Footer Status Pill */}
                <div className="flex items-center justify-between pt-1 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={11} />
                    Delivered via {log.channel || "Email"}
                  </span>
                  <span>Direct replies forwarded to {advisorName}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentOutreachHistoryTab;
