<div align="center">

<pre>
████████╗ ██████╗   █████╗   ██████╗ ███████╗ ██████╗   █████╗  ████████╗ ██╗  ██╗
╚══██╔══╝ ██╔══██╗ ██╔══██╗ ██╔════╝ ██╔════╝ ██╔══██╗ ██╔══██╗ ╚══██╔══╝ ██║  ██║
   ██║    ██████╔╝ ███████║ ██║      █████╗   ██████╔╝ ███████║    ██║    ███████║
   ██║    ██╔══██╗ ██╔══██║ ██║      ██╔══╝   ██╔═══╝  ██╔══██║    ██║    ██╔══██║
   ██║    ██║  ██║ ██║  ██║ ╚██████╗ ███████╗ ██║      ██║  ██║    ██║    ██║  ██║
   ╚═╝    ╚═╝  ╚═╝ ╚═╝  ╚═╝  ╚═════╝ ╚══════╝ ╚═╝      ╚═╝  ╚═╝    ╚═╝    ╚═╝  ╚═╝
</pre>

### Watch how graphs get solved, one step at a time.

</div>

<div align="center">

**Tracepath** is an interactive graph-algorithm visualizer. Paste a graph or pick a
preset, choose an algorithm, and step through the run — BFS, DFS, Dijkstra,
topological sort, DAG longest-path — with the frontier, visited set, and distances
shown live beside an animated canvas. No black box: every step the algorithm takes
is a state you can pause on, rewind to, or replay at any speed.

</div>

---

<div align="center">

🔗 **Live demo:** [DEPLOYED_URL]

</div>

---

## 🧭 How It Works

```
graph (JSON / adjacency list) → parseGraphInput → validateGraph
                                                        │
                                                        ▼
                                          algorithm(graph, startId)
                                        BFS · DFS · Dijkstra · Topo · Longest-Path
                                                        │
                                                        ▼
                                        step[]  { visited, frontier, current,
                                                   edgesUsed, extra }
                                                        │
                                                        ▼
                                   usePlayback(steps)  →  currentStep
                                                        │
                                                        ▼
                                   GraphCanvas + StateInspector (pure render)
```

Every algorithm is a **pure function** that takes a graph and returns a flat array
of steps — no recursion, no hidden mutation, no coupling to React. Each step is a
complete, immutable snapshot: what's visited, what's in the frontier (queue, stack,
priority queue, or ready-set depending on the algorithm), what's current, which
edges have been traversed, and an algorithm-specific `extra` payload (running
distances for Dijkstra, the emerging order for topo sort).

Because the algorithms know nothing about rendering, they're independently
testable — feed in a disconnected graph or a cyclic one and assert on the step
array directly. And because playback is just "which index of `steps` are we
looking at," rewind, replay, and speed changes fall out for free: there's no
simulation to re-run, only an index to move.

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="220">
      <h3>🧮</h3>
      <b>Five Algorithms</b><br/>
      <sub>BFS, DFS, Dijkstra, Topological Sort, DAG Longest Path — swap between them on the same graph</sub><br/>
    </td>
    <td align="center" width="220">
      <h3>⏯️</h3>
      <b>Full Playback Control</b><br/>
      <sub>Play, pause, step forward/back, reset, and scrub speed 0.5×–4× through any run</sub><br/>
    </td>
    <td align="center" width="220">
      <h3>✍️</h3>
      <b>Two Input Formats</b><br/>
      <sub>Paste raw JSON or a plain-text adjacency list — parser auto-detects which</sub><br/>
    </td>
  </tr>
  <tr>
    <td align="center" width="220">
      <h3>🗂️</h3>
      <b>Preset Graphs</b><br/>
      <sub>Grid, tree, DAG, and disconnected presets ready to load in one click</sub><br/>
    </td>
    <td align="center" width="220">
      <h3>✨</h3>
      <b>Animated Trace</b><br/>
      <sub>Nodes pulse and glow on state change, edges draw on stroke-by-stroke as they're traversed</sub><br/>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| ⚛️ Frontend | React + Vite | Core UI framework and bundler |
| 🗄️ Backend | None | Fully client-side — every algorithm runs in-browser, zero API calls |
| 🎬 Animation | Framer Motion | State-transition springs, staggered node entrance, edge draw-on trace |
| 🎨 Styling | Custom CSS (design tokens) | Single-accent dark theme, no component library |
| ☁️ Hosting | Vercel | Static Vite build, zero-config deploy |

---

## 📁 Project Structure

```bash
Tracepath/
├── public/
│   └── presets/            # grid.json, tree.json, dag.json, disconnected.json
├── src/
│   ├── algorithms/          # bfs, dfs, dijkstra, topoSort, dagLongestPath
│   │                         # + stepRecorder.js (shared step shape) + registry.js
│   ├── graph/                # model.js, parser.js, validate.js, layout.js
│   ├── playback/             # usePlayback.js, playbackControls.js
│   ├── components/           # GraphCanvas, Node, Edge, Legend,
│   │                         # PlaybackBar, StateInspector, GraphInput, AlgorithmSelect
│   ├── styles/                # theme.css (design tokens), motion.js
│   ├── utils/                 # colors.js
│   └── App.jsx
└── vercel.json
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/tracepath.git
cd tracepath
```

### 2. Install & Run

```bash
npm install
npm run dev
```

> Running at `http://localhost:5173`

### 3. Build for Production

```bash
npm run build     # outputs static site to dist/
npm run preview   # serve the production build locally
```

---

## 🎨 Design Decisions

- **One accent hue, not a palette.** Every state color (idle, visited, frontier,
  current) is derived from a single electric-cyan accent via opacity and
  lightness — never a second unrelated hue — so state changes stay legible
  instead of turning into a rainbow.
- **Deterministic layout over physics.** Node positions come from circular or
  longest-path layering, computed once per graph — no force simulation. The same
  graph always renders in the same place, which matters more for a teaching tool
  than an organic spread.
- **Step-recording as the core abstraction.** Decoupling "what the algorithm did"
  from "how it's drawn" means playback, rewind, and speed control all fall out of
  indexing into an array — and the algorithms are testable with zero UI in the
  loop.

