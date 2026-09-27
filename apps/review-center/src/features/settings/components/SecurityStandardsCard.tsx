import React from "react";
import { Shield, KeyRound, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SecurityStandardsCard() {
  return (
    <div className="flex flex-col gap-4">
      {/* Password Standards Policy */}
      <Card className="bg-card border border-border rounded-2xl p-5 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Shield size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Password Standards
            </h3>
            <p className="text-[11px] text-muted-foreground">
              BoardQuest Review Center Security Policy
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Must be at least 6 characters in length (10+ recommended).</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Include upper &amp; lower case letters and numerical digits.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
            <span>Never share or store credentials in unencrypted spreadsheets.</span>
          </div>
        </div>

        <div className="p-3 bg-muted/40 rounded-xl border border-border text-[11px] text-muted-foreground leading-relaxed mt-1">
          Password changes take effect immediately across all active internal review center candidate sessions and API endpoints.
        </div>
      </Card>

      {/* Authentication Integrity Standard */}
      <Card className="bg-card border border-border rounded-2xl p-5 shadow-2xs flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <KeyRound size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Security Standard
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Authentication Integrity
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1 text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-border/60">
            <span className="text-muted-foreground">Encryption Standard</span>
            <span className="font-semibold text-foreground font-mono text-[11px]">
              Bcrypt Hashed &amp; Salted
            </span>
          </div>
          <div className="flex justify-between items-center py-1.5">
            <span className="text-muted-foreground">Session Status</span>
            <Badge variant="success">
              Active &amp; Verified
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
