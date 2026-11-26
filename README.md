# Quantum Cryptography Simulator (BB84)

A game-style web app that teaches the BB84 quantum key distribution protocol to complete beginners. It is built from the Team 6 project proposal (Quantum Computing course, CADT).

Everything is explained the way you would explain it to a kid:
- a photon is a **light stick** that points one way;
- a filter (basis) is a pair of **magic glasses**: **+ glasses** or **× glasses**;
- a bit is a **number**, and the error rate counts **mistakes**.

The "grown-up words" are shown at the end of the Story and in the Lab.

| Tab | What you do |
|---|---|
| 📖 **Story** | A 7-page comic with Alice, Bob and Eve the spy, explaining the whole idea plus classical vs quantum (proposal feature 1: Learn). |
| 🎮 **Missions** | Four levels that earn up to 3 stars each. Each one unlocks after the one before it. |
| 🔬 **Photon Lab** | The full step-by-step simulator for 8–256 photons (feature 2), including the easy 8-photon example from slide 12. Tap a photon to follow it and see its Qiskit circuit. |
| 🕵️ **Spy Lab** | Turn Eve on and set how many photons she peeks at (0–100%), see the mistakes against the 11% spy line, and run a 0→100% chart against theory (feature 3). |
| 🏆 **Boss Quiz** | 5 kid-friendly questions, worth up to 3 stars (extra feature). |

The four missions:
1. **Read the light sticks.** Read 6 sticks using a cheat sheet, then press "look" with the right and wrong glasses. Each look is a real Qiskit measurement: the right glasses always give 0, the wrong ones give a coin flip.
2. **Be Bob: make a key.** Pick Bob's glasses for 8 photons. Qiskit measures them, Alice reveals her glasses, you tap the matches, and you get the secret key.
3. **Spy hunt.** Three detective cases with 96 photons each. Eve may or may not be hiding. You compare the checked numbers and decide whether a spy was there (feature 3).
4. **Secret message.** Make a 128-photon key, type a word, watch it get locked with XOR, see that Eve only gets nonsense, then watch Bob unlock it (feature 4).

Stars are saved in the browser (localStorage), so progress survives a page reload on the same computer.

## How it is built

| Layer | Folder | Tech |
|---|---|---|
| Quantum logic | `backend/bb84.py` | Qiskit + Qiskit Aer (stabilizer simulator) |
| Backend API | `backend/main.py` | FastAPI |
| Website | `frontend/` | React + Vite, Tailwind CSS, Recharts |

Each photon is one one-qubit circuit. Alice uses `X` to write bit 1 and `H` to switch to the × filter. Eve, if she reads the photon, measures in a guessed filter and re-sends it in that filter. Bob uses `H` for the × filter, then `M` to measure. Every photon of a run goes to `AerSimulator` in one batch, with 1 shot each.

API endpoints:

- `POST /api/run` takes `{n_photons, eve_on, eve_percent, check_percent, seed?, preset?}`. It can also take fixed `alice_bits`, `alice_filters` and `bob_filters` lists, which the game uses when the player picks Bob's glasses.
- `GET /api/measure` sends one photon and does one look. Mission 1 uses it for the right-vs-wrong glasses coin flip.
- `GET /api/sweep`
- `GET /api/circuit`
- `GET /api/health`

## Run it locally (Windows / PowerShell)

You need Python 3.10+ and Node.js 18+.

**1. Backend (first time only):**

```powershell
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

**2. Frontend (first time only):**

```powershell
cd frontend
npm install
npm run build
```

**3. Start it.** This one command serves both the API and the built website:

```powershell
cd backend
.venv\Scripts\python -m uvicorn main:app --port 8000
```

Then open http://localhost:8000.

**While editing the frontend**, use two terminals for hot reload. Run the backend as in step 3, plus:

```powershell
cd frontend
npm run dev
```

Then open http://localhost:5173. Vite forwards `/api` to port 8000.

## Check that it works

1. **Automated tests.** These check the proposal's success table, section 3:

   ```powershell
   cd backend
   .venv\Scripts\python -m pytest -q
   ```

   All 11 should pass. They cover:
   - the slide 12 example gives the key 0 0 1 0 1
   - about 50% of photons are kept
   - 0% errors without Eve
   - about 25% errors when Eve reads every photon
   - the key is rejected above 11%
   - partial Eve scales the error rate
   - the same seed gives the same result
   - the API works and rejects bad input
   - player-chosen glasses work
   - right glasses always read correctly, while wrong glasses give both 0 and 1
2. **In the browser:**
   - Footer: it should say "Simulator online (Qiskit …)".
   - Missions: play Mission 1 to 4 in order. Each one ends with a "Mission complete!" screen, and the ★ counter at the top goes up.
     - In Mission 1, the + glasses button always gives 0, while the × button gives a mix of 0s and 1s.
     - In Mission 2, tapping exactly the matching columns gives "Perfect!" and 3 stars.
   - Photon Lab: click **⭐ Easy 8-photon example**, then **Next step** ×2. Photons 1, 4, 5, 7, 8 have matching glasses and their numbers are `00101`.
   - Photon Lab: set 256 photons with Eve off and press **Send** and **Skip to the key**. You should see 0% mistakes, **Key is safe**, and identical keys.
   - Spy Lab: let Eve listen at 100% with 256 photons. You should see roughly 20–30% mistakes and **Spy caught! Key thrown away**. **Try 0% → 100%** should draw the purple line following the grey theory line up to about 25%.
   - To reset stars, clear the site's data for localhost:8000 in your browser.

## Deploy (Vercel + Render, as in the proposal)

**Backend on Render:**
1. Create a new Web Service and set the root directory to `backend`.
2. Build command: `pip install -r requirements.txt`.
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
4. Set the env var `ALLOWED_ORIGINS=https://<your-app>.vercel.app`.

**Frontend on Vercel:**
1. Set the root directory to `frontend`. The framework preset is Vite.
2. Set the env var `VITE_API_URL=https://<your-backend>.onrender.com`.

Or deploy only the backend after running `npm run build`. FastAPI serves `frontend/dist` itself.

## Known limits

- Photons are perfect and Eve uses one attack (intercept-and-resend), as stated in the proposal. There is no photon loss, noise, error correction or privacy amplification.
- With few photons only a few bits are checked, so Eve can slip through by luck. With 128+ photons she is caught almost every time.
- A true one-time pad needs one key bit per message bit, so the message length is limited by the key. 256 photons give about 96 key bits, which is roughly 12 characters.
- In Mission 3 Eve can still, rarely, get lucky and make fewer than 1-in-10 mistakes. The game then tells the player she got lucky, and marks their answer by the evidence they saw.
- Stars are stored per browser only. There are no accounts and no shared leaderboard.
