import { fileURLToPath } from "node:url";

// The distributable package lives in patch-gate/. Keep the repository-root
// command documented in the README working by running its CLI from there.
process.chdir(fileURLToPath(new URL("../patch-gate/", import.meta.url)));

require("../patch-gate/src/cli.ts");
