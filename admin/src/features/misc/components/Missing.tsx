import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

/* ─── Keyframe styles ─────────────────────────────────────── */
const keyframes = `
  @keyframes floatY {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-18px); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes glitch1 {
    0%,100% { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
    20%     { clip-path: inset(30% 0 50% 0); transform: translate(4px, 0); }
    40%     { clip-path: inset(60% 0 20% 0); transform: translate(-2px, 0); }
    60%     { clip-path: inset(10% 0 80% 0); transform: translate(3px, 0); }
    80%     { clip-path: inset(70% 0 10% 0); transform: translate(-1px, 0); }
  }
  @keyframes glitch2 {
    0%,100% { clip-path: inset(50% 0 30% 0); transform: translate(4px, 0); }
    25%     { clip-path: inset(20% 0 60% 0); transform: translate(-3px, 0); }
    50%     { clip-path: inset(80% 0 5%  0); transform: translate(2px, 0); }
    75%     { clip-path: inset(5%  0 85% 0); transform: translate(-4px, 0); }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(40px,-30px) scale(1.15); }
    66%     { transform: translate(-30px,20px) scale(0.9); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    40%     { transform: translate(-50px,35px) scale(1.1); }
    70%     { transform: translate(25px,-25px) scale(0.85); }
  }
  @keyframes dotPop {
    0%,100% { transform: scale(1); opacity: 0.3; }
    50%     { transform: scale(1.6); opacity: 0.8; }
  }
`;

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-primary/40"
      style={{
        animation: `dotPop 1.8s ${delay}s ease-in-out infinite`,
      }}
    />
  );
}

export default function Missing() {
  const navigate = useNavigate();

  return (
    <>
      <style>{keyframes}</style>

      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background text-foreground font-sans">
        {/* ── Background orbs ── */}
        <div
          className="absolute top-[10%] left-[8%] w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl pointer-events-none"
          style={{ animation: 'orb1 10s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[5%] right-[6%] w-[340px] h-[340px] rounded-full bg-primary/10 blur-3xl pointer-events-none"
          style={{ animation: 'orb2 13s ease-in-out infinite' }}
        />

        {/* ── Decorative dot grid (top-right) ── */}
        <div className="absolute top-10 right-14 grid grid-cols-6 gap-2.5 pointer-events-none hidden md:grid">
          {Array.from({ length: 24 }).map((_, i) => (
            <Dot key={i} delay={(i % 6) * 0.18} />
          ))}
        </div>

        {/* ── Decorative dot grid (bottom-left) ── */}
        <div className="absolute bottom-10 left-14 grid grid-cols-6 gap-2.5 pointer-events-none hidden md:grid">
          {Array.from({ length: 24 }).map((_, i) => (
            <Dot key={i} delay={(i % 6) * 0.22} />
          ))}
        </div>

        {/* ── Main card ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
          {/* Glitch 404 */}
          <div className="relative mb-6 leading-none select-none" style={{ animation: 'floatY 3.5s ease-in-out infinite' }}>
            {/* Main text */}
            <span className="text-8xl md:text-[11rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary block">
              404
            </span>

            {/* Glitch layer 1 */}
            <span
              aria-hidden
              className="absolute inset-0 text-8xl md:text-[11rem] font-black tracking-tighter text-blue-500/40 block"
              style={{ animation: 'glitch1 3s 1s steps(1) infinite' }}
            >
              404
            </span>

            {/* Glitch layer 2 */}
            <span
              aria-hidden
              className="absolute inset-0 text-8xl md:text-[11rem] font-black tracking-tighter text-primary/40 block"
              style={{ animation: 'glitch2 3s 1.3s steps(1) infinite' }}
            >
              404
            </span>
          </div>

          {/* Divider pill */}
          <div
            className="w-16 h-1 rounded-full bg-primary mb-6"
            style={{ animation: 'slideUp 0.6s 0.2s both' }}
          />

          {/* Heading */}
          <h1
            className="text-2xl md:text-3xl font-bold text-foreground mb-3 tracking-tight"
            style={{ animation: 'slideUp 0.6s 0.35s both' }}
          >
            Page Not Found
          </h1>

          {/* Sub-text */}
          <p
            className="text-sm text-muted-foreground leading-relaxed max-w-sm"
            style={{ animation: 'slideUp 0.6s 0.5s both' }}
          >
            Looks like this page took a wrong turn. It may have been moved,
            deleted, or never existed in the first place.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex gap-3 mt-8 flex-wrap justify-center"
            style={{ animation: 'slideUp 0.6s 0.65s both' }}
          >
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-11 px-5 rounded-xl text-sm font-semibold border-border text-foreground hover:bg-accent gap-2 cursor-pointer transition-all"
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>

            <Button
              onClick={() => navigate('/')}
              className="h-11 px-5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 gap-2 cursor-pointer shadow-md transition-all"
            >
              <Home size={16} />
              Back to Home
            </Button>
          </div>

          {/* Footer hint */}
          <p
            className="mt-10 text-xs text-muted-foreground"
            style={{ animation: 'slideUp 0.6s 0.8s both' }}
          >
            Error code: <span className="font-semibold text-primary">404</span> &mdash; Page not found
          </p>
        </div>
      </div>
    </>
  );
}