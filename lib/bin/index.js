#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const childProcess = require("child_process");
const path = require("path");
const args = process.argv;
const isDebug = ["-d", "--debug"].some((debugArg) => args.indexOf(debugArg) !== -1);
const isDebugBreak = ["-db", "--debug-brk"].some((debugArg) => args.indexOf(debugArg) !== -1);
const indexPath = path.resolve(__dirname, "umbra.js");
if (isDebug || isDebugBreak) {
    const nodePath = args[0];
    const inspectArg = isDebug ? "--inspect" : "--inspect-brk";
    const newArgs = [inspectArg, indexPath].concat(args.slice(2));
    childProcess.spawnSync(nodePath, newArgs, { stdio: "inherit" });
}
else {
    require(indexPath);
}
//# sourceMappingURL=index.js.map