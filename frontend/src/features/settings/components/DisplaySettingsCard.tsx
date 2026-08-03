import { useState } from "react";
import { LayoutGrid } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function DisplaySettingsCard() {
  const [defaultPageSize, setDefaultPageSize] = useState("10");
  const [compactMode, setCompactMode] = useState(false);

  return (
    <Card id="display" className="bg-card border border-border rounded-3xl shadow-xs overflow-hidden scroll-mt-6 font-sans">
      <CardHeader className="border-b border-border pb-4 pt-6 px-6 bg-card">
        <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
          <LayoutGrid size={18} className="text-primary" />
          Display & View Options
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure default table pagination and display density options.
        </p>
      </CardHeader>

      <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 p-4 bg-muted/40 border border-border rounded-2xl">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Default Table Page Size
          </label>
          <select
            value={defaultPageSize}
            onChange={(e) => {
              setDefaultPageSize(e.target.value);
              toast.success(`Default page size set to ${e.target.value} rows`);
            }}
            className="h-10 px-3 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-2 focus:ring-ring/20 focus:border-primary transition-all cursor-pointer"
          >
            <option value="10">10 items per page</option>
            <option value="20">20 items per page</option>
            <option value="50">50 items per page</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 p-4 bg-muted/40 border border-border rounded-2xl">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Compact View Mode
          </label>
          <div className="flex items-center justify-between h-10">
            <span className="text-xs font-medium text-foreground">Enable compact row spacing</span>
            <input
              type="checkbox"
              checked={compactMode}
              onChange={(e) => {
                setCompactMode(e.target.checked);
                toast.info(`Compact mode ${e.target.checked ? "enabled" : "disabled"}`);
              }}
              className="h-5 w-5 accent-primary rounded cursor-pointer"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
