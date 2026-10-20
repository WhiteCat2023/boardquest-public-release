import { useState } from "react";
import { LayoutGrid, Layers, SlidersHorizontal } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { showFeedback } from "@/components/modal";

export default function DisplaySettingsCard() {
  const [defaultPageSize, setDefaultPageSize] = useState("10");
  const [compactMode, setCompactMode] = useState(false);

  return (
    <Card id="display" className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border py-3 px-4 md:px-5 bg-card">
        <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
          <LayoutGrid size={16} className="text-primary" />
          Display & View Options
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center justify-between p-3 px-3.5 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Layers size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Table Page Size</span>
              <span className="text-[11px] text-muted-foreground">Default rows per view page.</span>
            </div>
          </div>
          <select
            value={defaultPageSize}
            onChange={(e) => {
              setDefaultPageSize(e.target.value);
              showFeedback.success(`Default page size set to ${e.target.value} rows`);
            }}
            className="h-8 px-2.5 bg-background border border-border rounded-lg text-xs font-semibold text-foreground focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="10">10 rows</option>
            <option value="20">20 rows</option>
            <option value="50">50 rows</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-3 px-3.5 bg-muted/30 border border-border rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <SlidersHorizontal size={15} />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Compact Table View</span>
              <span className="text-[11px] text-muted-foreground">Enable tighter row spacing.</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={compactMode}
            onChange={(e) => {
              setCompactMode(e.target.checked);
              showFeedback.info(`Compact mode ${e.target.checked ? "enabled" : "disabled"}`);
            }}
            className="h-4 w-4 accent-primary rounded cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  );
}
