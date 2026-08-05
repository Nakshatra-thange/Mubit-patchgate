import { EvalCase, CaseRunResult, CaseComparison } from "./types";
import { checkExpectation } from "./expectations";

export type AgentRunner = (
  input: string,
  context: string | undefined,
  systemInstruction: string
) => Promise<string>;

export async function runCase(
  agentFn: AgentRunner,
  systemInstruction: string,
  evalCase: EvalCase
): Promise<CaseRunResult> {
  const output = await agentFn(evalCase.input, evalCase.context, systemInstruction);
  const passed = checkExpectation(output, evalCase.expect);
  return { caseId: evalCase.id, output, passed };
}

export async function runAllCases(
  agentFn: AgentRunner,
  systemInstruction: string,
  cases: EvalCase[]
): Promise<CaseRunResult[]> {
  const results: CaseRunResult[] = [];
  for (const c of cases) {
    results.push(await runCase(agentFn, systemInstruction, c));
  }
  return results;
}

export function compareRuns(
  cases: EvalCase[],
  baselineResults: CaseRunResult[],
  candidateResults: CaseRunResult[]
): CaseComparison[] {
  return cases.map((c) => {
    const baseline = baselineResults.find((r) => r.caseId === c.id);
    const candidate = candidateResults.find((r) => r.caseId === c.id);

    if (!baseline || !candidate) {
      throw new Error(`Missing run result for case "${c.id}"`);
    }

    let status: CaseComparison["status"];
    if (baseline.passed && !candidate.passed) status = "regression";
    else if (!baseline.passed && candidate.passed) status = "improvement";
    else if (baseline.passed && candidate.passed) status = "unchanged-pass";
    else status = "unchanged-fail";

    return { caseId: c.id, input: c.input, baseline, candidate, status };
  });
}