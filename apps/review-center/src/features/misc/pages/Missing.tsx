import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Missing() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background text-foreground font-sans">
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <span className="text-8xl md:text-[10rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary block">
          404
        </span>

        <div className="w-16 h-1 rounded-full bg-primary mb-6" />

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight">
          Page Not Found
        </h1>

        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          The page you are looking for in the Review Center Portal may have been
          moved, deleted, or does not exist.
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
