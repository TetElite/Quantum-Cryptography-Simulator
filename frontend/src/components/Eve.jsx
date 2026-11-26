import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Bubble } from './Characters.jsx'
import { STATUS, pct } from './Simulator.jsx'

const axis = { fontSize: 12, fill: '#64748B' }
const asPct = (v) => `${Math.round(v * 100)}%`

export function EveScreen({ run, sweep, sweepBusy, onSweep }) {
  const bars = run
    ? [
        { name: 'Numbers said out loud', v: run.estimated_qber ?? 0 },
        { name: 'All kept numbers', v: run.actual_qber ?? 0 },
      ]
    : []
  return (
    <div className="screen-pad space-y-4">
      <div>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h3>How many mistakes this time?</h3>
          {run && <span className={`badge ${STATUS[run.status].cls}`}>{STATUS[run.status].label}</span>}
        </div>
        {run ? (
          <>
            <div className="text-[13px] muted">
              Eve peeked at {run.eve_count} of {run.n_photons} photons ({Math.round(run.eve_fraction * 100)}%).
              Alice and Bob only see the first bar. The second bar is the full truth that only the simulator knows.
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={bars} layout="vertical" margin={{ top: 14, right: 24, bottom: 0, left: 8 }}>
                <XAxis type="number" domain={[0, 0.5]} tickFormatter={asPct} tick={axis} ticks={[0, 0.11, 0.25, 0.5]} />
                <YAxis type="category" dataKey="name" width={150} tick={axis} />
                <Tooltip formatter={(v) => pct(v, 1)} />
                <ReferenceLine x={0.11} stroke="#0F172A" strokeDasharray="4 3" label={{ value: 'spy line 11%', position: 'top', fontSize: 11, fill: '#0F172A' }} />
                <Bar dataKey="v" name="Mistakes" radius={[0, 6, 6, 0]} isAnimationActive>
                  {bars.map((b, i) => <Cell key={i} fill={b.v > 0.11 ? '#DC2626' : '#16A34A'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </>
        ) : (
          <p className="muted">Let Eve listen and press <b>Send photons</b> to see what she does.</p>
        )}
      </div>
      <hr className="etched" />
      <div>
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h3>The more Eve peeks, the more mistakes</h3>
          <button className="btn-cyan" disabled={sweepBusy} onClick={onSweep}>{sweepBusy ? 'Running…' : sweep ? 'Run again' : 'Try 0% → 100%'}</button>
        </div>
        {sweep ? (
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={sweep.points} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
              <CartesianGrid stroke="#E2E8F0" />
              <XAxis dataKey="eve_percent" tickFormatter={(v) => `${v}%`} tick={axis} />
              <YAxis domain={[0, 0.35]} tickFormatter={asPct} tick={axis} ticks={[0, 0.11, 0.25]} />
              <Tooltip formatter={(v) => pct(v, 1)} labelFormatter={(l) => `Eve peeks at ${l}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <ReferenceLine y={0.11} stroke="#0F172A" strokeDasharray="4 3" />
              <Line type="linear" dataKey="theory" name="What the maths predicts (¼ of Eve's share)" stroke="#94A3B8" strokeDasharray="5 4" dot={false} />
              <Line type="monotone" dataKey="measured" name={`Qiskit simulation (${sweep.n_photons} photons each)`} stroke="#7C3AED" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="muted">Runs the game 11 times, with Eve peeking at 0%, 10%, … up to 100% of photons, and draws the mistakes.</p>
        )}
      </div>
    </div>
  )
}

export function EveLeft({ settings, setSettings, busy, error, onRun, onOpenTable, run }) {
  return (
    <>
      <div>
        <div className="text-[13px] text-[var(--ink-soft)]">Spy Lab</div>
        <h2>How does <span className="text-[var(--eve)]">Eve</span> get caught?</h2>
      </div>
      <Bubble who="eve">To steal a number I must look at the photon before Bob. But I don't know Alice's glasses, so I <b>guess</b>. When I guess wrong, I <b>bend the stick</b>!</Bubble>
      <div className="note info">
        Eve guesses wrong <b>half</b> the time. Then Bob is wrong <b>half</b> of those times.<br />
        Half of a half = <b>a quarter</b>, about <b>25 mistakes in every 100 numbers</b>. That's way over the spy line of 11.
      </div>
      <div className="rule" />
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={settings.eveOn} onChange={(e) => setSettings({ ...settings, eveOn: e.target.checked })} className="accent-[#7C3AED] w-4 h-4" />
        Let Eve the spy listen
      </label>
      <label className={settings.eveOn ? '' : 'opacity-50'}>
        Eve peeks at <b className="text-[var(--ink-strong)]">{settings.evePercent}%</b> of photons
        <input type="range" min={0} max={100} step={5} disabled={!settings.eveOn} value={settings.evePercent}
          onChange={(e) => setSettings({ ...settings, evePercent: Number(e.target.value) })} className="w-full accent-[#7C3AED]" />
      </label>
      <label>
        Photons Alice sends: <b className="text-[var(--ink-strong)]">{settings.nPhotons}</b>
        <input type="range" min={8} max={256} step={8} value={settings.nPhotons}
          onChange={(e) => setSettings({ ...settings, nPhotons: Number(e.target.value) })} className="w-full accent-[#0369A1]" />
      </label>
      <p className="text-[13px] muted m-0">Tip: with only a few photons, Eve can get lucky. Send 128 or more to catch her every time.</p>
      {error && <div className="note bad" role="alert">{error}</div>}
      <div className="flex flex-wrap items-center gap-3">
        <button className="pill" disabled={busy} onClick={() => onRun({ jumpTo: 5 })}>{busy ? 'Sending…' : <>Send <span className="hl">photons</span></>}</button>
        {run && <button className="btn-ghost-dark" onClick={onOpenTable}>See the photon table</button>}
      </div>
    </>
  )
}
