import { useEffect, useState } from 'react'
import { getCircuit } from '../api.js'
import { GlowPhoton, Photon, sym } from './Photon.jsx'
import { STATUS, pct } from './Simulator.jsx'

export const TABS = [
  { id: 'story', t: 'Story', ico: '📖' },
  { id: 'missions', t: 'Missions', ico: '🎮' },
  { id: 'simulator', t: 'Photon Lab', ico: '🔬' },
  { id: 'eve', t: 'Spy Lab', ico: '🕵️' },
  { id: 'quiz', t: 'Boss Quiz', ico: '🏆' },
]

export function TopBar({ tab, setTab, totalStars }) {
  return (
    <header className="topbar">
      <div className="wrap flex items-center gap-4 py-2.5 flex-wrap">
        <div className="flex items-center gap-2 mr-auto">
          <GlowPhoton size={38} />
          <div className="logo">Quantum Cryptography Simulator<small>Learn the BB84 secret-key game</small></div>
        </div>
        <span className="chip bg-[#FEF9C3] text-[#713F12] order-2 lg:order-3" title="Stars earned in Missions and the Boss Quiz">
          <span className="text-[var(--gold)] text-[16px]">★</span> {totalStars} / 15
        </span>
        <nav className="tabs order-3 lg:order-2 w-full lg:w-auto" aria-label="Main">
          {TABS.map((x) => (
            <button key={x.id} className={`tab ${tab === x.id ? 'active' : ''}`} aria-current={tab === x.id ? 'page' : undefined} onClick={() => setTab(x.id)}>
              <span className="ico" aria-hidden>{x.ico}</span>{x.t}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}

/** Page layout: a guide card (characters + buttons) next to the play board. */
export function Stage({ left, screen, tablet }) {
  return (
    <section className="stage">
      <div className="card stage-left">
        {left}
        {tablet && <div className="status">{tablet}</div>}
      </div>
      <div className="card board">{screen}</div>
    </section>
  )
}

export function StatusTablet({ run, revealed, health }) {
  if (!run) return <div className="text-[13px] muted">No photons sent yet. {health ? '' : <span className="text-[var(--bad)]">The simulator backend is offline.</span>}</div>
  const cell = (k, v) => <div className="bg-[#F8FAFC] rounded-lg px-2 py-1.5 text-center"><div className="text-[11px] muted">{k}</div><div className="font-extrabold text-[var(--ink-strong)]">{v}</div></div>
  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {cell('Photons', run.n_photons)}
        {cell('Kept', revealed.kept ? pct(run.keep_rate) : '…')}
        {cell('Mistakes', revealed.errors ? pct(run.estimated_qber, 0) : '…')}
        {cell('Key size', revealed.errors ? run.alice_key.length : '…')}
      </div>
      {revealed.errors && <div className="mt-2 text-center"><span className={`badge ${STATUS[run.status].cls}`}>{STATUS[run.status].label}</span></div>}
    </div>
  )
}

/** Shows one photon's journey in plain words, plus the Qiskit circuit that simulated it. */
export function Inspector({ run, index, step }) {
  const p = run?.photons[index]
  const [circ, setCirc] = useState({ key: null, text: '', error: null })
  const key = p ? `${p.alice_bit}${p.alice_filter}${p.bob_filter}${p.eve_filter ?? ''}` : null
  useEffect(() => {
    if (!p || circ.key === key) return
    let live = true
    const params = { alice_bit: p.alice_bit, alice_filter: p.alice_filter, bob_filter: p.bob_filter }
    if (p.eve_read) params.eve_filter = p.eve_filter
    getCircuit(params)
      .then((r) => live && setCirc({ key, text: r.circuit, error: null }))
      .catch((e) => live && setCirc({ key, text: '', error: e.message }))
    return () => { live = false }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!p) return null
  const show = step >= 2
  return (
    <section className="card p-5 grid md:grid-cols-[1fr_1.2fr] gap-5" aria-label="Follow one photon">
      <div className="text-[15px]">
        <h3 className="m-0 mb-2 text-[18px] font-extrabold text-[var(--ink-strong)]">Follow photon {p.index}</h3>
        <ol className="pl-5 m-0 space-y-1.5">
          <li>Alice sends the number <b>{p.alice_bit}</b> using <b>{sym(p.alice_filter)} glasses</b>, so the stick looks like <Photon filter={p.alice_filter} bit={p.alice_bit} />.</li>
          {p.eve_read && show && (
            <li>Eve peeks with <b>{sym(p.eve_filter)} glasses</b>.{' '}
              {p.eve_changed
                ? <span className="text-[var(--bad)]">Wrong guess! She bends the stick into <Photon filter={p.eve_filter} bit={p.eve_bit} color="#DC2626" />.</span>
                : <>Lucky guess: the stick stays <Photon filter={p.eve_filter} bit={p.eve_bit} />.</>}</li>
          )}
          {show && (
            <li>Bob looks with <b>{sym(p.bob_filter)} glasses</b> and reads <b className={p.error && step >= 4 ? 'text-[var(--bad)]' : ''}>{p.bob_bit}</b>.{' '}
              {p.same_filter ? 'Same glasses as Alice, so he can be sure.' : 'Different glasses from Alice, so it was only a coin-flip guess.'}</li>
          )}
          {step >= 3 && (
            <li>{p.same_filter ? <b className="text-[var(--good)]">Keep it!</b> : <b className="text-[#94A3B8]">Throw it away.</b>}
              {p.is_check && step >= 4 ? ' They say this number out loud to check for a spy.' : ''}
              {p.in_key && step >= 5 ? ' It becomes part of the secret key.' : ''}
              {p.error && step >= 4 ? <span className="text-[var(--bad)]"> Bob's number is wrong: a sign of a spy!</span> : ''}</li>
          )}
        </ol>
        <p className="muted text-[13px] mt-3 mb-0">Tap any column in the photon table to follow another photon.</p>
      </div>
      <div>
        <div className="text-[13px] muted mb-1"><b>For grown-ups:</b> the Qiskit circuit that simulated this photon. X writes a 1, H switches to × glasses, M measures (c0 = Bob, c1 = Eve).</div>
        <pre className="bits bg-[#0F172A] text-[#BAE6FD] rounded-xl p-3 overflow-x-auto m-0 text-[12px] leading-tight min-h-[90px]">
          {circ.error ? `Could not load circuit: ${circ.error}` : circ.text || 'Loading…'}
        </pre>
      </div>
    </section>
  )
}

export function Footer({ health, healthError }) {
  return (
    <footer className="wrap py-8 text-center text-[13px] muted">
      Team 6 · Group 2 Software Engineer · CADT Quantum Computing ·{' '}
      {health
        ? <span className="text-[var(--good)]">Simulator online (Qiskit {health.qiskit})</span>
        : <span className="text-[var(--bad)]">{healthError || 'Checking simulator…'}</span>}
    </footer>
  )
}
