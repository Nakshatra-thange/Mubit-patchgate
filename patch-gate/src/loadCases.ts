import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { EvalCase, CandidatePatch } from "./types";

// Reads a .json, .yaml, or .yml file and parses it into a plain object.
function readStructuredFile(filePath: string): any {
  const raw = fs.readFileSync(filePath, "utf-8");
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".json") {
    return JSON.parse(raw);
  }
  if (ext === ".yaml" || ext === ".yml") {
    return yaml.load(raw);
  }
  throw new Error(`Unsupported file type: ${ext}. Use .json, .yaml, or .yml`);
}

// Loads and validates a list of eval cases from a file.
export function loadEvalSet(filePath: string): EvalCase[] {
  const data = readStructuredFile(filePath);
  const cases = Array.isArray(data) ? data : data.cases;

  if (!Array.isArray(cases)) {
    throw new Error(
      `Eval set at ${filePath} must be an array of cases, or an object with a "cases" array`
    );
  }

  cases.forEach((c: any, i: number) => {
    if (!c.id) throw new Error(`Case at index ${i} is missing an "id"`);
    if (!c.input) throw new Error(`Case "${c.id}" is missing "input"`);
    if (!c.expect || !c.expect.type) {
      throw new Error(`Case "${c.id}" is missing a valid "expect" block`);
    }
  });

  return cases as EvalCase[];
}

// Loads and validates a single candidate patch from a file.
export function loadPatch(filePath: string): CandidatePatch {
  const data = readStructuredFile(filePath);

  if (!data.id) throw new Error(`Patch at ${filePath} is missing an "id"`);
  if (!data.instruction) {
    throw new Error(`Patch "${data.id}" is missing "instruction"`);
  }

  return data as CandidatePatch;
}