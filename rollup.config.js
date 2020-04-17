import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import builtins from "builtin-modules";
import commonjs from "@rollup/plugin-commonjs";
import { copyFileSync } from "fs";

const copyCli = () => {
    copyFileSync("node_modules/umbra-cli/lib/index.cjs.js", "lib/bin/umbra.js");
};
const copyCliFile = {
    name: "copy-cli-file",
    buildEnd: () => {
        copyCli();
    },
    watchChange: (id) => {
        if (id === "umbra-cli") {
            copyCli();
        }
    }
}


export default [{
    input: "lib/index.js",
    external: [...builtins],
    output: [{
        file: "lib/umbra.js",
        format: "cjs",
        interop: false,
        sourcemap: true
    }],
    plugins: [
        copyCliFile,
        resolve({
            preferBuiltins: true
        }),
        commonjs(),
        terser()
    ]
}];
