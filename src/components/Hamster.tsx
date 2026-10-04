import { useId } from "react";

export type HamsterState = "idle" | "walk" | "stuff" | "sad" | "happy";

/**
 * Desert hamster with chubby cheek pouches.
 * pouch (0-1): higher value = puffier cheeks.
 */
export function Hamster({
  size = 130,
  state = "idle",
  pouch = 1,
  holding,
}: {
  size?: number;
  state?: HamsterState;
  pouch?: number;
  holding?: string | null;
}) {
  const p = Math.max(0, Math.min(1, pouch));
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const furG = `furG-${uid}`;
  const cheekG = `cheekG-${uid}`;
  const bellyG = `bellyG-${uid}`;
  const cheekR = 11 + p * 13; // cheek pouch radius
  const bodyRx = 40 + p * 4;

  return (
    <div className="relative no-sel" style={{ width: size, height: size * 0.9 }}>
      <svg viewBox="0 0 150 132" width={size} height={size * 0.9} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id={furG} cx="38%" cy="30%" r="78%">
            <stop offset="0%" stopColor="#fff1d6" />
            <stop offset="45%" stopColor="#f4cf94" />
            <stop offset="100%" stopColor="#d99f5f" />
          </radialGradient>
          <radialGradient id={cheekG} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#ffe9c4" />
            <stop offset="100%" stopColor="#e6ab6a" />
          </radialGradient>
          <linearGradient id={bellyG} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="100%" stopColor="#f0dcc0" />
          </linearGradient>
        </defs>

        {/* floor shadow */}
        <ellipse cx="66" cy="122" rx="48" ry="6.5" fill="rgba(20,12,4,.24)" />
        {/* tail */}
        <circle cx="18" cy="86" r="6" fill="#e8b074" />
        {/* hind legs */}
        <ellipse cx="38" cy="106" rx="13" ry="7" fill="#f0c48f" />
        <ellipse cx="72" cy="108" rx="11" ry="6" fill="#f0c48f" />

        {/* torso (left side) */}
        <g
          className={state === "stuff" ? "anim-wiggle" : ""}
          style={{ transformOrigin: "42px 100px" }}
        >
          <ellipse cx="40" cy="80" rx="30" ry="27" fill={`url(#${furG})`} />
          <ellipse cx="34" cy="90" rx="18" ry="13" fill={`url(#${bellyG})`} opacity="0.85" />
        </g>

        {/* front body */}
        <g
          className={state === "stuff" ? "anim-push" : ""}
          style={{ transformOrigin: "60px 100px" }}
        >
          <ellipse cx="66" cy="76" rx={bodyRx} ry="35" fill={`url(#${furG})`} />
          {/* back stripe */}
          <path
            d={`M30 58 C48 44 92 42 112 56`}
            stroke="#d59a55"
            strokeWidth="4"
            fill="none"
            opacity="0.55"
            strokeLinecap="round"
          />
          {/* belly */}
          <ellipse cx="72" cy="90" rx="24" ry="17" fill={`url(#${bellyG})`} />

          {/* face */}
          <g>
          {/* ear */}
            <ellipse cx="104" cy="38" rx="9" ry="11" fill="#e7a968" />
            <ellipse cx="104" cy="39" rx="5" ry="7" fill="#d98a97" opacity="0.75" />
          {/* cheek pouch (far) */}
            <circle cx="98" cy="72" r={cheekR * 0.82} fill={`url(#${cheekG})`} opacity="0.95" />
          {/* head fur */}
            <circle cx="112" cy="62" r="24" fill={`url(#${furG})`} />
          {/* cheek pouch (near) */}
            <circle cx="98" cy="76" r={cheekR} fill={`url(#${cheekG})`} />
            <path
              d={`M${98 - cheekR} 76 A${cheekR} ${cheekR} 0 0 1 ${98 + cheekR} 76`}
              fill="none"
              stroke="#cf954f"
              strokeWidth="1.6"
              opacity="0.6"
            />
            {/* eye */}
            <circle cx="119" cy="56" r="5.4" fill="#2b1a10" />
            <circle cx="120.8" cy="54" r="2" fill="#fff" />
            {/* nose */}
            <ellipse cx="132" cy="66" rx="4.6" ry="3.4" fill="#e58a9c" />
            {/* mouth */}
            <path d="M129 72 q4 3 7 0" stroke="#b9767f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            {/* whiskers */}
            <g stroke="#c9a274" strokeWidth="1.2" opacity="0.85" strokeLinecap="round">
              <path d="M132 66 L146 60" />
              <path d="M132 69 L147 70" />
              <path d="M130 63 L142 53" />
            </g>
          </g>

          {/* front paws */}
          <g>
            <ellipse cx="104" cy="98" rx="9" ry="6.5" fill="#f7d9a9" />
            <ellipse cx="92" cy="100" rx="8" ry="6" fill="#f2d0a0" />
          </g>
        </g>

        {/* mood expression */}
        {state === "sad" && (
          <g stroke="#2b1a10" strokeWidth="2" strokeLinecap="round">
            <path d="M115 55 l7 3" />
            <path d="M132 68 q-4 3 -8 1" />
          </g>
        )}
        {state === "happy" && (
          <g>
            <path d="M126 70 q6 6 12 -1" stroke="#b9767f" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M115 53 q4 -3 8 0" stroke="#2b1a10" strokeWidth="2" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>

      {holding && (
        <div
          className="absolute text-2xl"
          style={{ left: "64%", top: "58%", transform: "translate(-50%,-50%)" }}
        >
          {holding}
        </div>
      )}
    </div>
  );
}


