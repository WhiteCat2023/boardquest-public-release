import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ─── Keyframes ──────────────────────────────────────────────────────────── */
const keyframes = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulseRing {
    0%   { transform: scale(0.92); opacity: 0.7; }
    60%  { transform: scale(1.08); opacity: 0.25; }
    100% { transform: scale(0.92); opacity: 0.7; }
  }
  @keyframes pulseRing2 {
    0%   { transform: scale(0.85); opacity: 0.4; }
    60%  { transform: scale(1.18); opacity: 0.08; }
    100% { transform: scale(0.85); opacity: 0.4; }
  }
  @keyframes lockShake {
    0%,100% { transform: rotate(0deg) translateY(0px); }
    10%     { transform: rotate(-5deg); }
    20%     { transform: rotate(5deg); }
    30%     { transform: rotate(-4deg); }
    40%     { transform: rotate(4deg); }
    50%,90% { transform: rotate(0deg) translateY(0px); }
    70%     { transform: translateY(-10px); }
    80%     { transform: translateY(0px); }
  }
  @keyframes scan {
    0%   { top: 0%; opacity: 0.6; }
    48%  { opacity: 0.6; }
    50%  { top: 100%; opacity: 0; }
    51%  { top: 0%; opacity: 0; }
    52%  { opacity: 0.6; }
    100% { top: 100%; opacity: 0.6; }
  }
  @keyframes orb1 {
    0%,100% { transform: translate(0,0) scale(1); }
    33%     { transform: translate(35px,-25px) scale(1.12); }
    66%     { transform: translate(-25px,18px) scale(0.92); }
  }
  @keyframes orb2 {
    0%,100% { transform: translate(0,0) scale(1); }
    40%     { transform: translate(-45px,30px) scale(1.08); }
    70%     { transform: translate(20px,-20px) scale(0.88); }
  }
  @keyframes dotPop {
    0%,100% { transform: scale(1); opacity: 0.3; }
    50%     { transform: scale(1.6); opacity: 0.8; }
  }
  @keyframes badgePing {
    0%   { transform: scale(1); opacity: 1; }
    75%  { transform: scale(2); opacity: 0; }
    100% { transform: scale(2); opacity: 0; }
  }
`;

function Dot({ delay }: { delay: number }) {
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full bg-destructive/40"
      style={{
        animation: `dotPop 1.8s ${delay}s ease-in-out infinite`,
      }}
    />
  );
}

export default function Unauthorized() {
  const navigate = useNavigate();

  return (
    <>
      <style>{keyframes}</style>

      <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center bg-background text-foreground font-sans">
        {/* ── Background orbs ── */}
        <div
          className="absolute top-[8%] right-[10%] w-[400px] h-[400px] rounded-full bg-destructive/10 blur-3xl pointer-events-none"
          style={{ animation: 'orb1 11s ease-in-out infinite' }}
        />
        <div
          className="absolute bottom-[6%] left-[5%] w-[320px] h-[320px] rounded-full bg-destructive/10 blur-3xl pointer-events-none"
          style={{ animation: 'orb2 14s ease-in-out infinite' }}
        />

        {/* ── Dot grids ── */}
        <div className="absolute top-10 left-14 grid grid-cols-6 gap-2.5 pointer-events-none hidden md:grid">
          {Array.from({ length: 24 }).map((_, i) => <Dot key={i} delay={(i % 6) * 0.18} />)}
        </div>
        <div className="absolute bottom-10 right-14 grid grid-cols-6 gap-2.5 pointer-events-none hidden md:grid">
          {Array.from({ length: 24 }).map((_, i) => <Dot key={i} delay={(i % 6) * 0.22} />)}
        </div>

        {/* ── Main content ── */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">

          {/* Shield + icon cluster */}
          <div className="relative w-36 h-36 mb-8" style={{ animation: 'slideUp 0.5s 0.1s both' }}>
            {/* Outer pulse ring 2 */}
            <div
              className="absolute -inset-5 rounded-full border-2 border-destructive/20"
              style={{ animation: 'pulseRing2 2.6s 0.4s ease-in-out infinite' }}
            />
            {/* Outer pulse ring */}
            <div
              className="absolute -inset-1.5 rounded-full border-2 border-destructive/35"
              style={{ animation: 'pulseRing 2.4s ease-in-out infinite' }}
            />

            {/* Circle background */}
            <div
              className="w-full h-full rounded-full bg-destructive/10 border border-destructive/20 shadow-md flex items-center justify-center relative overflow-hidden"
              style={{ animation: 'lockShake 4s 1s ease-in-out infinite' }}
            >
              {/* Scan beam */}
              <div
                className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-destructive to-transparent"
                style={{ animation: 'scan 2.5s linear infinite' }}
              />
              <ShieldOff size={52} className="text-destructive stroke-[1.5]" />
            </div>

            {/* "403" badge */}
            <div className="relative -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center justify-center">
              {/* Ping */}
              <span
                className="absolute w-8 h-8 rounded-full bg-destructive"
                style={{ animation: 'badgePing 1.5s 0.5s ease-out infinite' }}
              />
              <Badge
                variant="destructive"
                className="relative text-[11px] font-extrabold px-2.5 py-0.5 rounded-full tracking-wider shadow-sm"
              >
                403
              </Badge>
            </div>
          </div>

          {/* Divider pill */}
          <div
            className="w-14 h-1 rounded-full bg-destructive mb-5"
            style={{ animation: 'slideUp 0.6s 0.3s both' }}
          />

          {/* Heading */}
          <h1
            className="text-2xl md:text-3xl font-bold text-foreground mb-2.5 tracking-tight"
            style={{ animation: 'slideUp 0.6s 0.45s both' }}
          >
            Access Denied
          </h1>

          {/* Sub-text */}
          <p
            className="text-sm text-muted-foreground leading-relaxed max-w-sm"
            style={{ animation: 'slideUp 0.6s 0.6s both' }}
          >
            You don't have permission to view this page. If you think this is a
            mistake, please contact your administrator.
          </p>

          {/* Inline info tag */}
          <div
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive"
            style={{ animation: 'slideUp 0.6s 0.72s both' }}
          >
            <ShieldOff size={14} />
            Insufficient role privileges
          </div>

          {/* CTA Buttons */}
          <div
            className="flex gap-3 mt-8 flex-wrap justify-center"
            style={{ animation: 'slideUp 0.6s 0.82s both' }}
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
              className="h-11 px-5 rounded-xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2 cursor-pointer shadow-md transition-all"
            >
              <Home size={16} />
              Back to Home
            </Button>
          </div>

          {/* Footer hint */}
          <p
            className="mt-10 text-xs text-muted-foreground"
            style={{ animation: 'slideUp 0.6s 0.95s both' }}
          >
            Error code: <span className="font-semibold text-destructive">403</span> &mdash; Unauthorized Access
          </p>
        </div>
      </div>
    </>
  );
}