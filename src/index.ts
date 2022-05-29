#!/usr/bin/env node


import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import DebugCommand from "./commands/DebugCommand.js"





function main() {
    yargs(hideBin(process.argv))
        .scriptName("klutch")
        .showHelpOnFail(true)
        .command(DebugCommand)
        .options("e", {alias: "env", description: "environment", default: "sandbox", choices: ["sandbox", "production"]})
        .demandCommand()
        .parse()
}


main()