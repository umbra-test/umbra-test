#!/usr/bin/env node

import * as childProcess from "child_process";
import * as path from "path";

const args = process.argv;
const isDebug = ["-d", "--debug"].some((debugArg) => args.indexOf(debugArg) !== -1);
const isDebugBreak = ["-db", "--debug-brk"].some((debugArg) => args.indexOf(debugArg) !== -1);

const indexPath = path.resolve(__dirname, "umbra.js");
if (isDebug || isDebugBreak) {
    const nodePath = args[0];

    const inspectArg = isDebug ? "--inspect" : "--inspect-brk";
    const newArgs = [inspectArg, indexPath].concat(args.slice(2));
    childProcess.spawnSync(nodePath, newArgs, {stdio: "inherit"});
} else {
    // No point in spawning up a new process if the current one works fine.
    require(indexPath);
}