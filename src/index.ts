#!/usr/bin/env node


import yargs from "yargs"

// @ts-ignore
import { hideBin } from 'yargs/helpers'
import DebugCommand from "./commands/DebugCommand.js"
import InitCommand from "./commands/InitCommand.js"





function main() {
    yargs(hideBin(process.argv))
        .scriptName("klutch")
        .showHelpOnFail(true)
        .command(DebugCommand)
        .command(InitCommand)
        .options("e", {alias: "env", description: "environment", default: "sandbox", choices: ["sandbox", "production"]})
        .demandCommand()
        .parse()
}


main()