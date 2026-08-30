import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background text-foreground font-sans">
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <div className="relative size-24 mb-6 flex items-center justify-center rounded-full bg-destructive/10 border border-destructive/20 shadow-md">
          <ShieldOff className="size-12 text-destructive stroke-[1.5]" />
          <div className="absolute -bottom-2.5">
            <Badge
              variant="destructive"
              className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider shadow-xs"
            >
              403
            </Badge>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2.5 tracking-tight">
          Access Denied
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          You do not have permission to view this section of the Review Center
          Portal.
        </p>

        <div className="flex gap-3 mt-8 flex-wrap justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="h-10 px-5 rounded-xl text-xs font-bold border-border text-foreground hover:bg-accent gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>

          <Button
            onClick={() => navigate("/")}
            className="h-10 px-5 rounded-xl text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer shadow-md transition-all"
          >
            <Home className="size-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
