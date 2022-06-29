#!/usr/bin/env node


 import KlutchJS from "@klutch-card/klutch-js"
import yargs from "yargs"

// @ts-ignore
import { hideBin } from 'yargs/helpers'
 import DebugCommand from "./commands/DebugCommand.js"
import InitCommand from "./commands/InitCommand.js"
import LoginCommand from "./commands/LoginCommand.js"




function main() {

    KlutchJS.configure({        
        userPoolClientId: "12oebireo15skgf2r377oqjmus",
        userPoolServer: "https://cognito-idp.us-west-2.amazonaws.com/",
        serverUrl: "https://sandbox.klutchcard.com/graphql"
    })

    yargs(hideBin(process.argv))
        .scriptName("klutch")
        .showHelpOnFail(true)
        .command(DebugCommand)
        .command(InitCommand)
        .command(LoginCommand)
        .options("e", {alias: "env", description: "environment", default: "sandbox", choices: ["sandbox", "production"]})
        .demandCommand()
        .parse()
}


main() 