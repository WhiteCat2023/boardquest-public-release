import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useRoleFlags from "@/hooks/useRoleFlags";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Mail,
  Send,
  ExternalLink,
  Video,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Calendar,
} from "lucide-react";
import { showFeedback } from "@/components/modal";

export interface EmailStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: {
    id: string;
    name: string;
    email: string;
    level?: number;
    xp?: number;
    academicStanding?: string;
    isFailing?: boolean;
    failingSubjects?: string[];
    avgAccuracy?: number;
  } | null;
  guidanceId?: string;
  defaultSubjectCategory?: string;
  onSuccess?: () => void;
}

type TemplateType = "CHECKIN" | "REMEDIAL" | "CONSULTATION" | "COMMENDATION" | "CUSTOM";

export function EmailStudentModal({
  isOpen,
  onClose,
  student,
  guidanceId,
  defaultSubjectCategory,
  onSuccess,
}: EmailStudentModalProps) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { currentUser } = useRoleFlags();

  const [template, setTemplate] = useState<TemplateType>("CHECKIN");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [drillCategory, setDrillCategory] = useState(defaultSubjectCategory || "");

  const firstName = student?.name ? student.name.split(" ")[0] : "Student";
  const advisorName = currentUser?.name || "Your Academic Advisor";
  const weakList =
    student?.failingSubjects && student.failingSubjects.length > 0
      ? student.failingSubjects.join(", ")
      : defaultSubjectCategory || "core exam subjects";

  // Pre-generate template contents when student or template changes
  const applyTemplate = (t: TemplateType) => {
    setTemplate(t);
    if (t === "CHECKIN") {
      setSubject(`Academic Progress Check-In: BoardQuest Study Plan Review`);
      setMessage(
        `Dear ${firstName},\n\nI hope your board exam preparations are going well. I have been monitoring your recent study activity on BoardQuest and wanted to check in regarding your daily drill pace and study plan objectives.\n\nPlease take a look at your active objectives in your dashboard and reach out if you have questions or require targeted study resources.\n\nBest regards,\n${advisorName}`
      );
    } else if (t === "REMEDIAL") {
      setSubject(`Academic Remediation Notice: Recommended Focus for ${weakList}`);
      setMessage(
        `Dear ${firstName},\n\nI reviewed your recent accuracy and discipline performance on BoardQuest. Your overall standing is currently in the remediation zone, particularly in ${weakList}.\n\nTo raise your readiness before the licensure exam, please allocate focused time to complete recommended daily drills and review rationale explanations for incorrect items.\n\nPlease let me know once you have finished your next set of practice drills so we can review your updated trajectory.\n\nBest regards,\n${advisorName}`
      );
    } else if (t === "CONSULTATION") {
      setSubject(`Invitation: 1-on-1 Academic Advising Consultation`);
      setMessage(
        `Dear ${firstName},\n\nI would like to schedule a 1-on-1 academic advising session with you to review your test-taking strategies and address questions in your lagging disciplines.\n\nPlease use the consultation link below to join our scheduled session, or reply to this email with times that suit your schedule.\n\nLooking forward to speaking with you.\n\nBest regards,\n${advisorName}`
      );
    } else if (t === "COMMENDATION") {
      setSubject(`Commendation: Outstanding Effort on BoardQuest Milestones`);
      setMessage(
        `Dear ${firstName},\n\nCongratulations on your recent consistency and effort on BoardQuest! Your progress across your study milestones is commendable. Keep maintaining your steady daily drill pace as we move closer to the licensure exam.\n\nBest regards,\n${advisorName}`
      );
    }
  };

  useEffect(() => {
    if (isOpen && student) {
      setDrillCategory(defaultSubjectCategory || (student.failingSubjects?.[0] ?? ""));
      // Default to REMEDIAL if student is failing, otherwise CHECKIN
      if (student.isFailing || student.academicStanding === "FAILING") {
        applyTemplate("REMEDIAL");
      } else {
        applyTemplate("CHECKIN");
      }
    }
  }, [isOpen, student, defaultSubjectCategory]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!student?.id) throw new Error("Student is required");
      const res = await axiosPrivate.post("/guidance/reachout", {
        studentId: student.id,
        guidanceId,
        subject: subject.trim(),
        message: message.trim(),
        meetingLink: meetingLink.trim() || undefined,
        drillCategory: drillCategory.trim() || undefined,
        templateType: template,
      });
      return res.data;
    },
    onSuccess: () => {
      showFeedback.success(`Outreach email successfully sent to ${student?.name || "student"}!`);
      queryClient.invalidateQueries({ queryKey: ["guidanceAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["student", student?.id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      showFeedback.error(err?.response?.data?.message || "Failed to dispatch email.");
    },
  });

  const handleSend = () => {
    if (!subject.trim()) {
      showFeedback.error("Please enter an email subject line.");
      return;
    }
    if (!message.trim()) {
      showFeedback.error("Please compose a message for the student.");
      return;
    }
    sendMutation.mutate();
  };

  const getMailtoHref = () => {
    if (!student?.email) return "#";
    const encSubject = encodeURIComponent(subject.trim());
    const encBody = encodeURIComponent(
      meetingLink ? `${message}\n\nMeeting Link: ${meetingLink}` : message
    );
    return `mailto:${student.email}?subject=${encSubject}&body=${encBody}`;
  };

  if (!isOpen || !student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-border bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-primary/10 via-background to-muted p-6 border-b border-border">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/15 text-primary">
                <Mail size={18} />
              </div>
              <div>
                <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                  <span>Reach Out via Email</span>
                  <Badge variant="outline" className="text-[10px] font-bold py-0.5 bg-primary/10 text-primary border-primary/20">
                    Faculty Outreach
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Send an official guidance and advising email to your assigned student.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Student Profile Card Strip */}
          <div className="mt-4 p-3 rounded-2xl bg-background/80 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-primary/20 bg-primary/10 text-primary shrink-0">
                <AvatarFallback className="font-bold text-xs uppercase bg-primary/10 text-primary">
                  {student.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-foreground truncate">{student.name}</span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-extrabold px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20 rounded-full"
                  >
                    Lvl {student.level || 1}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground truncate">{student.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {student.isFailing || student.academicStanding === "FAILING" ? (
                <Badge
                  variant="destructive"
                  className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                >
                  <AlertTriangle size={11} />
                  Failing · {student.avgAccuracy ?? 0}%
                </Badge>
              ) : student.academicStanding === "PASSING" ? (
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                >
                  <CheckCircle2 size={11} />
                  Passing · {student.avgAccuracy ?? 0}%
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        {/* Modal Body Form */}
        <div className="p-6 space-y-4 max-h-[62vh] overflow-y-auto">
          {/* Quick Template Picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-primary" />
              <span>Select Communication Template</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => applyTemplate("CHECKIN")}
                className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer flex flex-col gap-0.5 ${
                  template === "CHECKIN"
                    ? "border-primary bg-primary/10 text-primary shadow-xs font-bold"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>Check-In</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">Study plan review</span>
              </button>

              <button
                type="button"
                onClick={() => applyTemplate("REMEDIAL")}
                className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer flex flex-col gap-0.5 ${
                  template === "REMEDIAL"
                    ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-xs font-bold"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <AlertTriangle size={12} />
                  <span>Remediation</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">Weak subjects</span>
              </button>

              <button
                type="button"
                onClick={() => applyTemplate("CONSULTATION")}
                className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer flex flex-col gap-0.5 ${
                  template === "CONSULTATION"
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-xs font-bold"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Consultation</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">1-on-1 meeting</span>
              </button>

              <button
                type="button"
                onClick={() => applyTemplate("COMMENDATION")}
                className={`p-2 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer flex flex-col gap-0.5 ${
                  template === "COMMENDATION"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold"
                    : "border-border hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <div className="flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>Commend</span>
                </div>
                <span className="text-[10px] opacity-80 font-normal">Praise milestones</span>
              </button>
            </div>
          </div>

          {/* Email Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="reachout-subject" className="text-xs font-bold text-foreground">
              Email Subject Line <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reachout-subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setTemplate("CUSTOM");
              }}
              placeholder="e.g. Academic Guidance Check-In: BoardQuest Study Plan Review"
              className="h-9 text-xs rounded-xl bg-muted/30 border-border"
            />
          </div>

          {/* Email Message Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="reachout-message" className="text-xs font-bold text-foreground">
                Message Body <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">
                Replies will go directly to your faculty email ({currentUser?.email || "advisor email"})
              </span>
            </div>
            <Textarea
              id="reachout-message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setTemplate("CUSTOM");
              }}
              rows={6}
              placeholder="Write your guidance instructions, feedback, and encouragement..."
              className="text-xs rounded-xl bg-muted/30 border-border font-sans resize-y leading-relaxed"
            />
          </div>

          {/* Optional Video / Consultation Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="reachout-meeting" className="text-xs font-bold text-foreground flex items-center gap-1">
                <Video size={12} className="text-blue-500" />
                <span>Consultation Link (Optional)</span>
              </Label>
              <Input
                id="reachout-meeting"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                className="h-8 text-xs rounded-xl bg-muted/30 border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reachout-focus" className="text-xs font-bold text-foreground flex items-center gap-1">
                <BookOpen size={12} className="text-primary" />
                <span>Focus Subject (Optional)</span>
              </Label>
              <Input
                id="reachout-focus"
                value={drillCategory}
                onChange={(e) => setDrillCategory(e.target.value)}
                placeholder="e.g. Clinical Chemistry"
                className="h-8 text-xs rounded-xl bg-muted/30 border-border"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-muted/30 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Secondary Action: Open in External Mail Client */}
          <a
            href={getMailtoHref()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 font-semibold transition-colors"
            title="Open pre-filled draft in your default desktop mail app (Outlook, Apple Mail, etc.)"
          >
            <ExternalLink size={12} />
            <span>Open in Desktop Mail Client</span>
          </a>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={sendMutation.isPending}
              className="h-8 px-3 text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="h-8 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              {sendMutation.isPending ? (
                <>
                  <span className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={13} />
                  <span>Send Official Email</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default EmailStudentModal;
