#!/usr/bin/env node


import KlutchJS from "@klutch-card/klutch-js"
import yargs, { Argv } from "yargs"
import 'dotenv/config'

// @ts-ignore
import { hideBin } from 'yargs/helpers'
 import DebugCommand from "./commands/DebugCommand.js"
import InitCommand from "./commands/InitCommand.js"
import LoginCommand from "./commands/LoginCommand.js"
import PublishCommand from "./commands/PublishCommand.js"
import GenerateKeyCommand from "./commands/GenerateKey.js"
import TestUserCommand from "./commands/test-user/TestUserCommand.js"
import WhoAmICommand from "./commands/WhoAmICommand.js"
import BuildTemplatesCommand from "./commands/BuildTemplatesCommand.js"





function main() {



    yargs(hideBin(process.argv))
        .scriptName("klutch")
        .showHelpOnFail(true)
        .middleware(argv => {
            if (argv.e  !== "production")  {
                KlutchJS.configure({        
                    userPoolClientId: "12oebireo15skgf2r377oqjmus",
                    userPoolServer: "https://cognito-idp.us-west-2.amazonaws.com/",
                   // serverUrl: "https://sandbox.klutchcard.com/graphql"
                   serverUrl: "http://localhost:8080/graphql"
                })
            } else {
                KlutchJS.configure({        
                    userPoolClientId: "12oebireo15skgf2r377oqjmus",
                    userPoolServer: "https://cognito-idp.us-west-2.amazonaws.com/",
                    serverUrl: "https://graphql.klutchcard.com/graphql"
                })
            }
        })
//        .command(DebugCommand)
        .command(InitCommand)
        .command(LoginCommand)
        .command(PublishCommand)
        .command(GenerateKeyCommand)   
        .command(TestUserCommand)     
        .command(WhoAmICommand)     
//        .command(BuildTemplatesCommand)
        .options("c", {alias: "configFile", description: "Path to klutch.json", default: "./klutch.json"})
        .options("e", {alias: "env", description: "Environment", hidden: true})
        .demandCommand()
        .parse()
}


main() 