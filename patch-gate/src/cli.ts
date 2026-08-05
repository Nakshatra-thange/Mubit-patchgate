import * as path from "path";
import { loadPatch, loadEvalSet } from "./loadCases";
import { runAllCases, AgentRunner } from "./runner";
import { compareRuns } from "./runner";
import { evaluateGate } from "./gate";
import { printReport } from "./report";

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const patchPath = args.patch as string;
  const casesPath = args.cases as string;
  const agentPath = args.agent as string;
  const budget = args.budget !== undefined ? Number(args.budget) : 0;
  const requireImprovement = Boolean(args["require-improvement"]);

  if (!patchPath || !casesPath || !agentPath) {
    console.error(
      "Usage: tsx src/cli.ts --patch <file> --cases <file> --agent <file> [--budget N] [--require-improvement]"
    );
    process.exit(1);
  }

  const patch = loadPatch(patchPath);
  const cases = loadEvalSet(casesPath);

  const resolvedAgentPath = path.resolve(process.cwd(), agentPath);
  const agentModule = require(resolvedAgentPath);
  const agentFn: AgentRunner = agentModule.run ?? agentModule.default;

  if (typeof agentFn !== "function") {
    console.error(`Agent module at ${agentPath} must export a "run" function`);
    process.exit(1);
  }

  console.log(`Running baseline (${cases.length} cases)...`);
  const baselineResults = await runAllCases(agentFn, "", cases);

  console.log(`Running candidate patch "${patch.id}" (${cases.length} cases)...`);
  const candidateResults = await runAllCases(agentFn, patch.instruction, cases);

  const comparisons = compareRuns(cases, baselineResults, candidateResults);
  const report = evaluateGate(patch, comparisons, {
    regressionBudget: budget,
    requireNetImprovement: requireImprovement,
  });

  printReport(report);
  process.exit(report.passed ? 0 : 1);
}

main().catch((err) => {
  console.error("patchgate failed:", err.message);
  process.exit(1);
});