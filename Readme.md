# patchgate

A regression gate for AI agents that write their own instructions.

## The gap

Agents that learn from their own runs — writing themselves new "lessons"
based on what worked or didn't — can improve over time. But nothing
stops a new lesson from being subtly wrong. It might fix the exact
case it was written for and quietly break three other cases that used
to work fine.

If every self-written lesson gets auto-applied with no check, the
agent can get worse without anyone noticing — there's no equivalent
of a test suite for behavior the agent invented for itself. Recent
research (GRASP, Self-Harness) shows gating self-improvement this way
produces large, reliable gains, but every implementation is glued to
one paper's own benchmark. There's no simple, generic, bring-your-own-agent
version of that checkpoint.

## How this helps

Before a new lesson gets adopted, patchgate replays it against a set
of past cases you already know the right answer to — once with the
old behavior, once with the proposed new behavior — and compares the
two. If the new version breaks something that used to pass, that's a
regression, and you can choose not to let it through. If it only
helps, it's safe to auto-apply. Same idea as a test suite guarding
code, applied instead to an agent's evolving instructions.

## Technical Implementation

## `src/`

### `types.ts`
Core data shapes:
- `EvalCase`
- `CandidatePatch`
- `GateReport`
- etc.

### `loadCases.ts`
Reads `.json` / `.yaml` evaluation sets and patches, then validates them.

### `expectations.ts`
Checks an output against:
- `contains`
- `equals`
- `regex`

rules.

### `runner.ts`
Runs every evaluation case through both the baseline agent and the candidate agent.

### `gate.ts`
Determines pass/fail based on the regression count compared to the allowed budget.

### `report.ts`
Prints a colored, human-readable verdict to the terminal.

### `cli.ts`
Wires everything together and parses:

- `--patch`
- `--cases`
- `--agent`
- `--budget`

---

## `examples/`

### `patch.yaml`
Sample candidate patch.

### `cases.yaml`
Sample evaluation set.

### `mock-agent.js`
Fake agent with canned replies. No API key required.

### `anthropic-agent.js`
Real agent adapter using the Anthropic API.

## What it is

A small, framework-agnostic CLI. You give it:
- a **candidate patch** — the new instruction/lesson being proposed
- an **eval set** — past cases with expected outcomes
- your **agent** — any function that takes an input and returns an output

It runs every case twice (baseline vs. patched), diffs the results,
and returns a pass/fail verdict with a configurable regression
tolerance. It doesn't care what framework or model your agent uses —
you supply one function, patchgate does the rest.

**Flow:** `cli.ts` loads the patch and eval set, then calls your agent
function twice per case — once with no system instruction (baseline),
once with the patch's instruction injected (candidate). `runner.ts`
collects both sets of outputs and diffs them case by case into one of
four states: regression, improvement, unchanged-pass, unchanged-fail.
`gate.ts` counts the regressions, compares that count to your allowed
budget, and returns pass or fail. `report.ts` prints the verdict plus
a full breakdown, and the process exits with code `0` (pass) or `1`
(fail) so it can be dropped straight into CI.

Your own agent just has to match this shape:

```js
async function run(input, context, systemInstruction) {
  // call your real agent/LLM here, applying systemInstruction if set
  return "the agent's output as a string";
}
module.exports = { run };
```

## How to run it

Install dependencies:
```bash
npm install
```

Run the gate with the included example (no API key needed):
```bash
npx tsx src/cli.ts --patch examples/patch.yaml --cases examples/cases.yaml --agent examples/mock-agent.js --budget 0
```

Same patch, more tolerance:
```bash
npx tsx src/cli.ts --patch examples/patch.yaml --cases examples/cases.yaml --agent examples/mock-agent.js --budget 1
```

To run it against a real LLM instead of the mock agent:
```bash
npm install dotenv @anthropic-ai/sdk
```
Add a `.env` file in the project root: