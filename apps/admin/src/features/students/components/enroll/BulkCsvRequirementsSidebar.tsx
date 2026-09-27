import { HelpCircle, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { downloadStudentSampleCSV } from "../../utils/csvParser";

export function BulkCsvRequirementsSidebar() {
  return (
    <div className="space-y-4">
      <Card className="border border-border/80 shadow-2xs bg-card rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 p-4">
          <CardTitle className="text-xs font-bold flex items-center gap-2 text-foreground">
            <HelpCircle size={15} className="text-primary" />
            CSV Column Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-xs text-muted-foreground space-y-2.5 font-medium">
          <p className="text-[11px]">Header row must include:</p>
          <ul className="space-y-1.5 list-disc list-inside text-foreground/90 bg-muted/30 p-2.5 rounded-xl border border-border/60 text-[11px]">
            <li>
              <strong className="text-foreground font-bold">FirstName &amp; LastName</strong> (or{" "}
              <strong className="text-foreground font-bold">Name</strong>) (Required)
            </li>
            <li>
              <strong className="text-foreground font-bold">Email</strong> (Required)
            </li>
            <li>
              <strong className="text-foreground font-bold">Location</strong> (Optional)
            </li>
          </ul>

          <Button
            type="button"
            onClick={downloadStudentSampleCSV}
            className="w-full mt-2 text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 rounded-xl gap-2 cursor-pointer shadow-2xs h-9"
          >
            <Download size={14} />
            Download Sample CSV Template
          </Button>
        </CardContent>
      </Card>

      <Card className="border border-primary/20 bg-primary/5 shadow-2xs rounded-2xl p-4">
        <div className="flex items-center gap-2 text-primary font-bold text-xs mb-1">
          <Mail size={15} />
          <span>Credential Dispatch</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Login credentials and portal access details will automatically be emailed to each enrolled student.
        </p>
      </Card>
    </div>
  );
}
