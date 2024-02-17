import { writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { exec } from "node:child_process";

const DESTINATION_FOLDER = "lib";

const runScript = promisify(exec);
const createPackageJson = () =>
  writeFile(
    `${DESTINATION_FOLDER}/package.json`,
    JSON.stringify({ type: "commonjs" }),
    "utf-8",
  );

(async () => {
  await runScript(`swc src -d ${DESTINATION_FOLDER}`);
  await createPackageJson();
})();
