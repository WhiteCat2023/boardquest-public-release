import { HelpCircle, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BulkUserRequirementsSidebarProps {
  isExternal: boolean;
  onDownloadSampleCSV: () => void;
  onDownloadSampleXLSX: () => void;
}

export function BulkUserRequirementsSidebar({
  isExternal,
  onDownloadSampleCSV,
  onDownloadSampleXLSX,
}: BulkUserRequirementsSidebarProps) {
  return (
    <div className="space-y-4">
      <Card className="border border-border/80 shadow-2xs bg-card rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60 p-4">
          <CardTitle className="text-xs font-bold flex items-center gap-2 text-foreground">
            <HelpCircle
              size={15}
              className={
                isExternal ? "text-purple-600 dark:text-purple-400" : "text-primary"
              }
            />
            Spreadsheet Column Requirements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-xs text-muted-foreground space-y-2.5 font-medium">
          <p className="text-[11px]">Header row must include:</p>
          <ul className="space-y-1.5 list-disc list-inside text-foreground/90 bg-muted/30 p-2.5 rounded-xl border border-border/60 text-[11px]">
            {isExternal ? (
              <>
                <li>
                  <strong className="text-foreground font-bold">CompanyName</strong>{" "}
                  (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">
                    FirstName &amp; LastName
                  </strong>{" "}
                  (or <strong className="text-foreground font-bold">Name</strong>) (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">PartnerID</strong>{" "}
                  (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">Email</strong>{" "}
                  (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">PhoneNumber</strong>{" "}
                  (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">Location</strong>{" "}
                  (Optional)
                </li>
              </>
            ) : (
              <>
                <li>
                  <strong className="text-foreground font-bold">
                    FirstName &amp; LastName
                  </strong>{" "}
                  (or <strong className="text-foreground font-bold">Name</strong>) (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">MiddleName</strong>{" "}
                  (Optional)
                </li>
                <li>
                  <strong className="text-foreground font-bold">EmployeeID</strong>{" "}
                  (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">Email</strong>{" "}
                  (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">PhoneNumber</strong>{" "}
                  (Required)
                </li>
                <li>
                  <strong className="text-foreground font-bold">Role</strong> (TEACHER,
                  TEAMLEAD, DEAN)
                </li>
              </>
            )}
          </ul>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              onClick={onDownloadSampleCSV}
              className={`w-full text-xs font-semibold rounded-xl gap-2 cursor-pointer shadow-2xs h-8.5 ${
                isExternal
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 hover:bg-purple-500/20"
                  : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
              }`}
            >
              <Download size={13} />
              Download Template (.csv)
            </Button>

            <Button
              type="button"
              onClick={onDownloadSampleXLSX}
              className={`w-full text-xs font-semibold rounded-xl gap-2 cursor-pointer shadow-2xs h-8.5 ${
                isExternal
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <Download size={13} />
              Download Template (.xlsx)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card
        className={`shadow-2xs rounded-2xl p-4 border ${
          isExternal
            ? "border-purple-500/20 bg-purple-500/5"
            : "border-primary/20 bg-primary/5"
        }`}
      >
        <div
          className={`flex items-center gap-2 font-bold text-xs mb-1 ${
            isExternal
              ? "text-purple-600 dark:text-purple-400"
              : "text-primary"
          }`}
        >
          <Mail size={15} />
          <span>Credential Dispatch</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Login passwords will be automatically generated and dispatched to each
          registered email address upon successful import.
        </p>
      </Card>
    </div>
  );
}
