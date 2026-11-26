import { useId } from 'react'
import { sym } from './Photon.jsx'

export const NAMES = { alice: 'Alice', bob: 'Bob', eve: 'Eve the spy' }
const LOOK = {
  alice: { shirt: '#00A8FF', hair: '#6B4226' },
  bob: { shirt: '#F39C12', hair: '#2F2F2F' },
  eve: { shirt: '#7B4FBF', hair: '#4B2C7F' },
}

/** Simple cartoon faces for the three characters. */
export function Avatar({ who, size = 56 }) {
  const id = useId().replace(/:/g, '')
  const c = LOOK[who]
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={NAMES[who]} className="shrink-0">
      <defs><clipPath id={`c${id}`}><circle cx="32" cy="32" r="30" /></clipPath></defs>
      <circle cx="32" cy="32" r="31" fill={who === 'eve' ? '#2A2238' : '#EAF6FF'} stroke="#fff" strokeWidth="2" />
      <g clipPath={`url(#c${id})`}>
        {who === 'alice' && <path d="M17 30 Q15 46 21 50 L23 30Z M47 30 Q49 46 43 50 L41 30Z" fill={c.hair} />}
        <path d="M10 66 Q10 45 32 45 Q54 45 54 66Z" fill={c.shirt} />
        <circle cx="32" cy="29" r="13" fill="#F2C9A6" />
        {who === 'alice' && (<><path d="M18 29 Q18 13 32 13 Q46 13 46 29 Q41 19 32 19 Q23 19 18 29Z" fill={c.hair} /><circle cx="32" cy="12" r="5" fill={c.hair} /></>)}
        {who === 'bob' && <path d="M19 26 Q19 14 32 14 Q45 14 45 26 L42 22 L37 24 L32 21 L27 24 L22 22Z" fill={c.hair} />}
        {who === 'eve' && (<>
          <path d="M15 38 Q14 10 32 10 Q50 10 49 38 Q45 21 32 21 Q19 21 15 38Z" fill={c.hair} />
          <rect x="20" y="24" width="24" height="8" rx="4" fill="#1C1C1C" />
          <circle cx="27" cy="28" r="1.8" fill="#fff" /><circle cx="37" cy="28" r="1.8" fill="#fff" />
          <path d="M27 36 Q33 38 37 34" stroke="#5A3A2A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>)}
        {who !== 'eve' && (<>
          <circle cx="27" cy="29" r="1.8" fill="#333" /><circle cx="37" cy="29" r="1.8" fill="#333" />
          <path d="M27 35 Q32 39 37 35" stroke="#7A4A3A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>)}
      </g>
    </svg>
  )
}

/** A character saying something in a speech bubble. */
export function Bubble({ who, children, size = 48 }) {
  return (
    <div className="flex gap-3 items-start">
      <Avatar who={who} size={size} />
      <div className={`bubble ${who}`}>
        <div className="bubble-name">{NAMES[who]}</div>
        {children}
      </div>
    </div>
  )
}

export const GLASS_COLOR = { '+': '#00A8FF', x: '#F08C00' }

/** Magic glasses: "+" glasses (blue) and "×" glasses (orange). Scientists call them filters or bases. */
export function Glasses({ filter, size = 44, label = true }) {
  const col = GLASS_COLOR[filter]
  return (
    <span className="inline-flex flex-col items-center leading-none align-middle">
      <svg width={size} height={size * 0.5} viewBox="0 0 48 24" role="img" aria-label={`${sym(filter)} glasses`}>
        <path d="M21 11 Q24 7 27 11" stroke={col} strokeWidth="2.5" fill="none" />
        <path d="M3 10 L0 7 M45 10 L48 7" stroke={col} strokeWidth="2.5" />
        {[12, 36].map((x) => (
          <g key={x}>
            <circle cx={x} cy="12" r="9.5" fill="#fff" stroke={col} strokeWidth="2.5" />
            <text x={x} y="16.5" textAnchor="middle" fontSize="13" fontWeight="700" fill={col}>{sym(filter)}</text>
          </g>
        ))}
      </svg>
      {label && size >= 40 && <span className="text-[10px] font-bold mt-0.5" style={{ color: col }}>{sym(filter)} glasses</span>}
    </span>
  )
}

/** Compact glasses marker for tables: a big coloured + or ×. */
export function GlassTag({ filter }) {
  if (!filter) return null
  return <span className={`gtag ${filter === 'x' ? 'x' : 'p'}`} aria-label={`${sym(filter)} glasses`}>{sym(filter)}</span>
}

/** A photon nobody has looked at yet: a glowing ball with a question mark. */
export function Mystery({ size = 34, label = '?' }) {
  return <span className="mystery" style={{ width: size, height: size, fontSize: size * 0.45 }} aria-label="photon not read yet">{label}</span>
}

export function Stars({ n = 0, max = 3, size = 16 }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={`${n} of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => <span key={i} className={i < n ? 'on' : ''}>★</span>)}
    </span>
  )
}

export function Celebrate({ stars, title, children }) {
  return (
    <div className="text-center py-4 pop">
      <div className="text-[13px] muted uppercase tracking-wider">Mission complete!</div>
      <div className="text-[22px] font-bold text-[var(--ink-strong)] my-1">{title}</div>
      <Stars n={stars} size={38} />
      <div className="text-[13px] mt-2 max-w-md mx-auto">{children}</div>
    </div>
  )
}
