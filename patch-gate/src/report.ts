import { GateReport } from "./types";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function icon(status: string): string {
  switch (status) {
    case "regression": return `${RED}✗ regressed${RESET}`;
    case "improvement": return `${GREEN}✓ improved${RESET}`;
    case "unchanged-pass": return `${DIM}= still passing${RESET}`;
    case "unchanged-fail": return `${DIM}= still failing${RESET}`;
    default: return status;
  }
}

export function printReport(report: GateReport): void {
  const verdict = report.passed
    ? `${GREEN}${BOLD}PASS${RESET}`
    : `${RED}${BOLD}FAIL${RESET}`;

  console.log("");
  console.log(`Patch: ${report.patchId}  ->  ${verdict}`);
  console.log(report.reason);
  console.log("");
  console.log(`${BOLD}Cases (${report.totalCases} total, ${report.regressionCount} regressed, ${report.improvementCount} improved)${RESET}`);
  console.log("-".repeat(60));

  for (const c of report.comparisons) {
    console.log(`${c.caseId}: ${icon(c.status)}`);
    if (c.status === "regression") {
      console.log(`${DIM}  input:    ${c.input}${RESET}`);
      console.log(`${DIM}  baseline: ${c.baseline.output}${RESET}`);
      console.log(`${DIM}  candidate:${c.candidate.output}${RESET}`);
    }
  }
  console.log("-".repeat(60));
  console.log("");
}