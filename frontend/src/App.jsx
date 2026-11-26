import { useEffect, useState } from 'react'
import { getHealth, runBB84, runSweep } from './api.js'
import { Footer, Inspector, Stage, StatusTablet, TopBar } from './components/Chrome.jsx'
import { EveLeft, EveScreen } from './components/Eve.jsx'
import { MISSIONS, Missions } from './components/Missions.jsx'
import { QuizLeft, QuizScreen, quizStars } from './components/Quiz.jsx'
import { SimLeft, SimScreen } from './components/Simulator.jsx'
import { StoryLeft, StoryScreen } from './components/Story.jsx'

const SAVE_KEY = 'qcs-stars-v1'
function loadStars() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {} } catch { return {} }
}

export default function App() {
  const [tab, setTab] = useState('story')
  const [settings, setSettings] = useState({ nPhotons: 16, eveOn: false, evePercent: 100, checkPercent: 25, seed: '' })
  const [run, setRun] = useState(null)
  const [step, setStep] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(0)
  const [sweep, setSweep] = useState(null)
  const [sweepBusy, setSweepBusy] = useState(false)
  const [storyPage, setStoryPage] = useState(0)
  const [mission, setMission] = useState(0)
  const [stars, setStars] = useState(loadStars)
  const [quiz, setQuiz] = useState({ index: 0, answers: {} })
  const [health, setHealth] = useState(null)
  const [healthError, setHealthError] = useState(null)

  useEffect(() => {
    getHealth().then(setHealth).catch((e) => setHealthError(e.message))
  }, [])
  useEffect(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(stars)) } catch { /* storage may be blocked */ }
  }, [stars])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [tab])

  const setStar = (id, n) => setStars((s) => ({ ...s, [id]: Math.max(s[id] || 0, n) }))
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0)
  const unlocked = (i) => i === 0 || (stars[MISSIONS[i - 1].id] || 0) > 0

  async function doRun({ preset = null, jumpTo = 1 } = {}) {
    setBusy(true)
    setError(null)
    try {
      const body = { n_photons: Number(settings.nPhotons), eve_on: settings.eveOn, eve_percent: Number(settings.evePercent), check_percent: Number(settings.checkPercent), preset }
      if (settings.seed !== '') body.seed = Number(settings.seed)
      setRun(await runBB84(body))
      setStep(jumpTo)
      setSelected(0)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function doSweep() {
    setSweepBusy(true)
    setError(null)
    try {
      setSweep(await runSweep(800))
    } catch (e) {
      setError(e.message)
    } finally {
      setSweepBusy(false)
    }
  }

  const views = {
    story: {
      left: <StoryLeft page={storyPage} setPage={setStoryPage} onStart={() => { setMission(0); setTab('missions') }} />,
      screen: <StoryScreen page={storyPage} />,
    },
    simulator: {
      left: <SimLeft settings={settings} setSettings={setSettings} run={run} step={run ? step : 0} setStep={setStep} busy={busy} error={error} onRun={doRun} />,
      screen: <SimScreen run={run} step={run ? step : 0} selected={selected} onSelect={setSelected} />,
    },
    eve: {
      left: <EveLeft settings={settings} setSettings={setSettings} busy={busy} error={error} onRun={doRun} run={run} onOpenTable={() => { setStep(5); setTab('simulator') }} />,
      screen: <EveScreen run={run} sweep={sweep} sweepBusy={sweepBusy} onSweep={doSweep} />,
    },
    quiz: {
      left: <QuizLeft quiz={quiz} setQuiz={setQuiz} onFinish={(score) => setStar('quiz', quizStars(score))} />,
      screen: <QuizScreen quiz={quiz} setQuiz={setQuiz} />,
    },
  }
  const v = views[tab]
  const labTab = tab === 'simulator' || tab === 'eve'
  const revealed = { kept: tab !== 'simulator' || step >= 3, errors: tab !== 'simulator' || step >= 4 }

  return (
    <>
      <TopBar tab={tab} setTab={setTab} totalStars={totalStars} />
      <main className="wrap space-y-5 pt-5">
        {/* Missions stay mounted so switching tabs doesn't lose a game in progress */}
        <div hidden={tab !== 'missions'}>
          <Missions mission={mission} setMission={setMission} stars={stars} setStar={setStar} unlocked={unlocked}
            totalStars={totalStars} onQuiz={() => setTab('quiz')} />
        </div>
        {v && <Stage left={v.left} screen={v.screen} tablet={labTab ? <StatusTablet run={run} revealed={revealed} health={health} /> : null} />}
        {run && labTab && <Inspector run={run} index={selected} step={tab === 'eve' ? 5 : step} />}
      </main>
      <Footer health={health} healthError={healthError} />
    </>
  )
}
