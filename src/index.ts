import yargs from "yargs"
import { hideBin } from 'yargs/helpers'
import DebugCommand from "./commands/DebugCommand.js"





function main() {
    yargs(hideBin(process.argv))
        .command(DebugCommand)
        .options("e", {alias: "env", description: "environment", default: "sandbox", choices: ["sandbox", "production"]})
        .parse()
}


main()