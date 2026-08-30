import { Link } from "react-router-dom";
import { Users, Calendar, Award, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function EmptyDashboardState() {
  return (
    <div className="space-y-6">
      {/* Main Empty State Banner */}
      <div className="p-8 md:p-10 rounded-3xl bg-card border border-border text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
        <div className="size-16 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-inner">
          <Sparkles className="size-8 animate-pulse" />
        </div>

        <div className="max-w-md space-y-1.5">
          <h3 className="text-lg font-black text-foreground">
            Review Center Dashboard is Ready
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Welcome to your BoardQuest Partner Portal. Once your review cohort and assessment schedules are synchronized with the university, candidate progress and analytics will display here.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button asChild size="sm" className="rounded-xl font-bold gap-2">
            <Link to="/candidates">
              <Users className="size-3.5" />
              <span>View Enrolled Students</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-xl font-bold gap-2">
            <Link to="/schedules">
              <Calendar className="size-3.5" />
              <span>Evaluation Schedules</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Feature Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-6 space-y-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Candidate Monitoring</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Track student progress, question attempts, and topic-level strengths across all licensure subjects.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-6 space-y-3">
            <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Mock Board Schedules</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Coordinate review sessions, diagnostic drills, and live mock board examinations seamlessly.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-2xs">
          <CardContent className="p-6 space-y-3">
            <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Award className="size-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">Readiness Analytics</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Access cohort performance trends, passing rate predictions, and subject mastery distributions.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default EmptyDashboardState;
