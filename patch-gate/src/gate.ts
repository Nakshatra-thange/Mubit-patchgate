import { CandidatePatch, CaseComparison, GateConfig, GateReport } from "./types";

export function evaluateGate(
  patch: CandidatePatch,
  comparisons: CaseComparison[],
  config: GateConfig
): GateReport {
  const regressionCount = comparisons.filter((c) => c.status === "regression").length;
  const improvementCount = comparisons.filter((c) => c.status === "improvement").length;

  let passed = regressionCount <= config.regressionBudget;
  let reason = "";

  if (!passed) {
    reason = `${regressionCount} case(s) regressed, which exceeds the allowed budget of ${config.regressionBudget}`;
  } else if (config.requireNetImprovement && improvementCount === 0) {
    passed = false;
    reason = `No cases improved. requireNetImprovement is set, so a neutral patch is rejected`;
  } else if (regressionCount > 0) {
    reason = `${regressionCount} case(s) regressed but within the allowed budget of ${config.regressionBudget}. ${improvementCount} case(s) improved`;
  } else {
    reason = `No regressions. ${improvementCount} case(s) improved`;
  }

  return {
    patchId: patch.id,
    totalCases: comparisons.length,
    comparisons,
    regressionCount,
    improvementCount,
    passed,
    reason,
  };
}