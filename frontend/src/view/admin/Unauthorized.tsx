import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, ShieldOff } from 'lucide-react';

/* ─── Keyframes ──────────────────────────────────────────────────────────── */
const keyframes = `
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
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
    0%,100% { transform: scale(1); opacity: 0.4; }
    50%     { transform: scale(1.6); opacity: 1; }
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
      style={{
        display: 'inline-block',
        width: 5, height: 5,
        borderRadius: '50%',
        background: '#A70202',
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

      <div
        className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ background: '#FAFAFA', fontFamily: 'Poppins, sans-serif' }}
      >
        {/* ── Background orbs ── */}
        <div style={{
          position: 'absolute', top: '8%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #fde8e8 0%, transparent 70%)',
          animation: 'orb1 11s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '6%', left: '5%',
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, #fde8e8 0%, transparent 70%)',
          animation: 'orb2 14s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* ── Dot grids ── */}
        <div style={{
          position: 'absolute', top: 40, left: 60,
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10,
          pointerEvents: 'none',
        }}>
          {Array.from({ length: 24 }).map((_, i) => <Dot key={i} delay={(i % 6) * 0.18} />)}
        </div>
        <div style={{
          position: 'absolute', bottom: 40, right: 60,
          display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10,
          pointerEvents: 'none',
        }}>
          {Array.from({ length: 24 }).map((_, i) => <Dot key={i} delay={(i % 6) * 0.22} />)}
        </div>

        {/* ── Main content ── */}
        <div className="flex flex-col items-center text-center px-8" style={{ zIndex: 1, maxWidth: 540 }}>

          {/* Shield + icon cluster */}
          <div style={{ position: 'relative', width: 140, height: 140, marginBottom: '2rem', animation: 'slideUp 0.5s 0.1s both' }}>
            {/* Outer pulse ring 2 */}
            <div style={{
              position: 'absolute', inset: -20,
              borderRadius: '50%',
              border: '2px solid rgba(167,2,2,0.2)',
              animation: 'pulseRing2 2.6s 0.4s ease-in-out infinite',
            }} />
            {/* Outer pulse ring */}
            <div style={{
              position: 'absolute', inset: -6,
              borderRadius: '50%',
              border: '2px solid rgba(167,2,2,0.35)',
              animation: 'pulseRing 2.4s ease-in-out infinite',
            }} />

            {/* Circle background */}
            <div style={{
              width: '100%', height: '100%', borderRadius: '50%',
              background: 'linear-gradient(145deg, #fde8e8, #fff1f1)',
              boxShadow: '0 8px 32px rgba(167,2,2,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'lockShake 4s 1s ease-in-out infinite',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Scan beam */}
              <div style={{
                position: 'absolute', left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(167,2,2,0.5), transparent)',
                animation: 'scan 2.5s linear infinite',
              }} />
              <ShieldOff size={52} color="#A70202" strokeWidth={1.5} />
            </div>

            {/* "403" badge */}
            <div style={{ position: 'relative', top: -14, left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Ping */}
              <span style={{
                position: 'absolute',
                width: 32, height: 32, borderRadius: '50%',
                background: '#A70202',
                animation: 'badgePing 1.5s 0.5s ease-out infinite',
              }} />
              <span style={{
                position: 'relative',
                background: 'linear-gradient(135deg, #A70202, #E05252)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 99,
                letterSpacing: '0.08em',
                boxShadow: '0 2px 10px rgba(167,2,2,0.4)',
                whiteSpace: 'nowrap',
              }}>
                403
              </span>
            </div>
          </div>

          {/* Divider pill */}
          <div style={{
            width: 50, height: 4, borderRadius: 99,
            background: 'linear-gradient(90deg, #A70202, #E05252)',
            marginBottom: '1.25rem',
            animation: 'slideUp 0.6s 0.3s both',
          }} />

          {/* Heading */}
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 700,
            color: '#1a1a2e', marginBottom: '0.65rem',
            animation: 'slideUp 0.6s 0.45s both',
          }}>
            Access Denied
          </h1>

          {/* Sub-text */}
          <p style={{
            fontSize: '0.95rem', color: '#6b7280',
            lineHeight: 1.75, maxWidth: 380,
            animation: 'slideUp 0.6s 0.6s both',
          }}>
            You don't have permission to view this page. If you think this is a
            mistake, please contact your administrator.
          </p>

          {/* Inline info tag */}
          <div style={{
            marginTop: '1.25rem',
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 12,
            background: '#fde8e8', border: '1px solid #f9c5c5',
            fontSize: '0.8rem', color: '#A70202', fontWeight: 500,
            animation: 'slideUp 0.6s 0.72s both',
          }}>
            <ShieldOff size={14} />
            Insufficient role privileges
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 mt-8 flex-wrap justify-center" style={{ animation: 'slideUp 0.6s 0.82s both' }}>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200"
              style={{ borderColor: '#E9B0B0', color: '#A70202', background: 'white' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#fde8e8'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'white'; }}
            >
              <ArrowLeft size={16} />
              Go Back
            </button>

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #A70202, #E05252)',
                color: 'white',
                boxShadow: '0 4px 18px rgba(167,2,2,0.35)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(167,2,2,0.5)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 18px rgba(167,2,2,0.35)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <Home size={16} />
              Back to Home
            </button>
          </div>

          {/* Footer hint */}
          <p style={{
            marginTop: '2.5rem', fontSize: '0.78rem',
            color: '#9ca3af', animation: 'slideUp 0.6s 0.95s both',
          }}>
            Error code: <span style={{ fontWeight: 600, color: '#A70202' }}>403</span> &mdash; Unauthorized Access
          </p>
        </div>
      </div>
    </>
  );
}