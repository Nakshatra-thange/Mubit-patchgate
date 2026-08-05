import { Expectation } from "./types";

export function checkExpectation(output: string, expect: Expectation): boolean {
  switch (expect.type) {
    case "contains":
      return output.includes(expect.value);
    case "equals":
      return output.trim() === expect.value.trim();
    case "regex":
      return new RegExp(expect.value).test(output);
    default:
      throw new Error(`Unknown expectation type: ${(expect as any).type}`);
  }
}