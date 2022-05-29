import {  Argv } from "yargs"
import DebugServer from "../debugserver/DebugServer"
import qrcode from "qrcode-terminal"
import ip from 'ip';


 const DebugCommand =  {
    command: "debug <recipeId>",
    describe: "Starts the Debug Server",

    builder: (yargs: Argv)  => yargs
        .positional("recipeId", {describe: "RecipeId to Debug", type: 'string'})
        .option("p", {alias: "port", describe: "Server Port", type: "number", default: 3000})
        .option("distPath", {describe: "Distribution Path", default: "./dist"}),

    handler: ({recipeId, port, distPath}: any) => {


        const server = new DebugServer({port, distPath}).start()

        qrcode.generate(`klutch://klutch?debugRecipeId=${recipeId}&debugRecipeUrl=http://${ip.address()}:${port}`, {small: true})
    }
}

export default DebugCommand