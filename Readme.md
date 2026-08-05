# patchgate

A regression gate for self-modifying AI agents.

## The problem

Agents that write themselves new instructions or "lessons" after each
run can quietly get worse instead of better — a new rule that fixes
one case can silently break a different one. patchgate replays a
candidate change against a set of past cases, compares it to the old
behavior, and tells you whether it's safe to auto-apply.

## Quick start

npm install
npx tsx src/cli.ts --patch examples/patch.yaml --cases examples/cases.yaml --agent examples/mock-agent.js --budget 0

Try the same command with --budget 1 to see the gate pass anyway despite the regression.

## Eval case format (YAML or JSON)

cases:
  - id: unique-id
    input: "message sent to the agent"
    expect:
      type: contains | equals | regex
      value: "what the output should satisfy"

## Patch format

id: patch-id
description: what this change is meant to do
instruction: the actual text injected into the agent's system prompt

## Writing your own agent adapter

Export a function matching this shape:

async function run(input, context, systemInstruction) {
  // call your real agent/LLM here, applying systemInstruction if set
  return "the agent's output as a string";
}
module.exports = { run };

patchgate calls this once with systemInstruction = "" (baseline) and
once with systemInstruction = the patch's instruction (candidate),
then diffs the results.

## Options

--budget N              number of regressions tolerated (default 0)
--require-improvement   fail the patch if it doesn't fix at least one case

## Why this exists

Papers like GRASP and Self-Harness show gating self-improvement this
way produces large, reliable gains for agents that learn from their
own runs — but each implementation is tied to one paper's benchmark.
patchgate is the generic, bring-your-own-agent version of that same
checkpoint.