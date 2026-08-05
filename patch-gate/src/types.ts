
export interface EvalCase {
    id: string;
    input: string;       
    context?: string;     
    expect: Expectation;
  }
  
  export type Expectation =
    | { type: "contains"; value: string }   
    | { type: "equals"; value: string }   
    | { type: "regex"; value: string };     
  

  export interface CandidatePatch {
    id: string;
    description: string;   
    instruction: string;   
  }
  

  export interface CaseRunResult {
    caseId: string;
    output: string;
    passed: boolean;
  }
  
  export interface CaseComparison {
    caseId: string;
    input: string;
    baseline: CaseRunResult;
    candidate: CaseRunResult;
    status: "regression" | "improvement" | "unchanged-pass" | "unchanged-fail";
  }
  

  export interface GateConfig {
    regressionBudget: number;       
    requireNetImprovement?: boolean; 
  }
  
  
  export interface GateReport {
    patchId: string;
    totalCases: number;
    comparisons: CaseComparison[];
    regressionCount: number;
    improvementCount: number;
    passed: boolean;
    reason: string;
  }