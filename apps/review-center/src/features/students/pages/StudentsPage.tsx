import { Users, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function StudentsPage() {
  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight">
            Enrolled Candidates
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage and track candidate cohort progress and evaluation records.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="size-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search candidate by name, school ID, or email..."
            className="pl-10 h-10 rounded-xl"
            disabled
          />
        </div>
        <Button variant="outline" size="sm" className="h-10 rounded-xl gap-2 w-full sm:w-auto" disabled>
          <Filter className="size-3.5" />
          <span>Filter Batch</span>
        </Button>
      </div>

      {/* Empty State */}
      <Card className="rounded-3xl border-border bg-card p-12 text-center shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
            <Users className="size-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-black text-foreground">
              No Enrolled Candidates Yet
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When candidates are enrolled into your review center cohort by the university administration, their profiles and performance records will be displayed here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StudentsPage;
