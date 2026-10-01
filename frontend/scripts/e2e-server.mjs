import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";

if (process.env.PROJECT_S_E2E !== "1" || process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
  throw new Error("E2E server must use the isolated demo configuration.");
}

const root = fileURLToPath(new URL("../", import.meta.url));
const cli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
let child;

function run(args) {
  return new Promise((resolve, reject) => {
    child = spawn(process.execPath, [cli, ...args], { cwd: root, env: process.env, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Next.js ${args[0]} exited with ${code}`));
    });
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => { child?.kill(signal); process.exit(0); });
}

// Next generates this file even with a separate distDir/tsconfig. Restore only
// that generated reference, so E2E runs do not redirect the normal app's types.
const nextEnvPath = new URL("../next-env.d.ts", import.meta.url);
const originalNextEnv = await readFile(nextEnvPath, "utf8");
try {
  await run(["build"]);
} finally {
  const generatedNextEnv = await readFile(nextEnvPath, "utf8");
  const generatedOnlyChange = generatedNextEnv.replace("./.next-e2e/types/routes.d.ts", "./.next/types/routes.d.ts");
  // Next may normalize Windows CRLF when regenerating this file.
  const normalizeNewlines = (value) => value.replace(/\r\n/g, "\n");
  if (normalizeNewlines(generatedOnlyChange) === normalizeNewlines(originalNextEnv)) {
    await writeFile(nextEnvPath, originalNextEnv);
  } else if (generatedNextEnv !== originalNextEnv) {
    throw new Error("next-env.d.ts changed unexpectedly; preserving it for inspection.");
  }
}
await run(["start", "-H", "127.0.0.1", "-p", "3100"]);
