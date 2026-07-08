import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

/* ─── Keyframe styles injected once ─────────────────────────────────────── */
const keyframes = `
  @keyframes floatY {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-18px); }
  }
  @keyframes pulseFade {
    0%, 100% { opacity: 0.15; transform: scale(1); }
    50%       { opacity: 0.35; transform: scale(1.08); }
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
    0%,100% { transform: scale(1); opacity: 0.5; }
    50%     { transform: scale(1.6); opacity: 1; }
  }
`;

/* ─── Dot component for decorative grid ─────────────────────────────────── */
function Dot({ delay }: { delay: number }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: '#A70202',
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

      <div
        className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
        style={{ background: '#FAFAFA', fontFamily: 'Poppins, sans-serif' }}
      >
        {/* ── Background orbs ── */}
        <div
          style={{
            position: 'absolute', top: '10%', left: '8%',
            width: 420, height: 420, borderRadius: '50%',
            background: 'radial-gradient(circle, #fde8e8 0%, transparent 70%)',
            animation: 'orb1 10s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', bottom: '5%', right: '6%',
            width: 340, height: 340, borderRadius: '50%',
            background: 'radial-gradient(circle, #fde8e8 0%, transparent 70%)',
            animation: 'orb2 13s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* ── Decorative dot grid (top-right) ── */}
        <div
          style={{
            position: 'absolute', top: 40, right: 60,
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <Dot key={i} delay={(i % 6) * 0.18} />
          ))}
        </div>

        {/* ── Decorative dot grid (bottom-left) ── */}
        <div
          style={{
            position: 'absolute', bottom: 40, left: 60,
            display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <Dot key={i} delay={(i % 6) * 0.22} />
          ))}
        </div>

        {/* ── Main card ── */}
        <div
          className="flex flex-col items-center text-center px-8"
          style={{ zIndex: 1, maxWidth: 560 }}
        >
          {/* Glitch 404 */}
          <div
            style={{
              position: 'relative',
              animation: 'floatY 3.5s ease-in-out infinite',
              marginBottom: '1.5rem',
              lineHeight: 1,
            }}
          >
            {/* Main text */}
            <span
              style={{
                fontSize: 'clamp(7rem, 18vw, 12rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                background: 'linear-gradient(135deg, #A70202 0%, #E05252 50%, #A70202 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block',
                userSelect: 'none',
              }}
            >
              404
            </span>

            {/* Glitch layer 1 */}
            <span
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                fontSize: 'clamp(7rem, 18vw, 12rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#60a5fa',
                display: 'block',
                animation: 'glitch1 3s 1s steps(1) infinite',
                userSelect: 'none',
              }}
            >
              404
            </span>

            {/* Glitch layer 2 */}
            <span
              aria-hidden
              style={{
                position: 'absolute', inset: 0,
                fontSize: 'clamp(7rem, 18vw, 12rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                color: '#f472b6',
                display: 'block',
                animation: 'glitch2 3s 1.3s steps(1) infinite',
                userSelect: 'none',
              }}
            >
              404
            </span>
          </div>

          {/* Divider pill */}
          <div
            style={{
              width: 60, height: 4, borderRadius: 99,
              background: 'linear-gradient(90deg, #A70202, #E05252)',
              marginBottom: '1.5rem',
              animation: 'slideUp 0.6s 0.2s both',
            }}
          />

          {/* Heading */}
          <h1
            style={{
              fontSize: '1.65rem', fontWeight: 700,
              color: '#1a1a2e', marginBottom: '0.75rem',
              animation: 'slideUp 0.6s 0.35s both',
            }}
          >
            Page Not Found
          </h1>

          {/* Sub-text */}
          <p
            style={{
              fontSize: '0.95rem', color: '#6b7280',
              lineHeight: 1.7, maxWidth: 380,
              animation: 'slideUp 0.6s 0.5s both',
            }}
          >
            Looks like this page took a wrong turn. It may have been moved,
            deleted, or never existed in the first place.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex gap-3 mt-8 flex-wrap justify-center"
            style={{ animation: 'slideUp 0.6s 0.65s both' }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200"
              style={{
                borderColor: '#E9B0B0',
                color: '#A70202',
                background: 'white',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#fde8e8';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'white';
              }}
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
          <p
            style={{
              marginTop: '2.5rem', fontSize: '0.78rem',
              color: '#9ca3af', animation: 'slideUp 0.6s 0.8s both',
            }}
          >
            Error code: <span style={{ fontWeight: 600, color: '#A70202' }}>404</span> &mdash; Page not found
          </p>
        </div>
      </div>
    </>
  );
}