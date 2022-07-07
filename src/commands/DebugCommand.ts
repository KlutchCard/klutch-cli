import {  Argv } from "yargs"
import DebugServer from "../debugserver/DebugServer.js"
import qrcode from "qrcode-terminal"
import {internalIpV4Sync}  from "internal-ip"
import TemplateBuilder from "../templateBuilder/TemplateBuilder.js"
import Manifest from "../Manifest.js"
import { AuthService, GraphQLService } from "@klutch-card/klutch-js"
import gql from "graphql-tag"
import KlutchRc from "../klutchservice/KlutchRc.js"
import  { login } from "./LoginCommand.js"
import PublishCommand from "./PublishCommand.js"
import  { listUsers } from "./test-user/ListTestUserCommand.js"
import inquirer from "inquirer"
import CreateTestUserCommand from "./test-user/CreateTestUserCommand.js"



async function getRecipeIdFromName(projectName: string): Promise<string> {
    const resp = await GraphQLService.query(gql`
        query($projectName: String) {
            developer {
                myRecipe(projectName: $projectName) {
                    id
                }
            }
        }
    `, {projectName})
    return resp.developer.myRecipe.id
}

 const DebugCommand =  {
    command: "debug",
    describe: "Starts the Debug Server",

    builder: (yargs: Argv)  => yargs
        .option("s", {alias: "host", type: 'string'})
        .option("e", {alias: "env", description: "environment", default: "sandbox", choices: ["sandbox", "production"]})
        .option("p", {alias: "port", describe: "Server Port", type: "number", default: 3000}),

    handler:async  (params: any) => {

        const {port, env, host, configFile} = params
        const {projectName, buildPath, templatesPath} = Manifest(configFile)

        const token = await KlutchRc.load()

        if (!token || !(await AuthService.getAuthToken(token))) {
           const ret =  await login(params)
           if (!ret) return
        }

        const testUsers = await listUsers()
        if (!testUsers || testUsers.length == 0) {
            const resp = await inquirer.prompt([{
                type: "confirm", 
                name: "createTestUser", 
                message: "There are no Test users created for this Miniapp. Do you want to create one?"}])
            if (resp.createTestUser) {
                await CreateTestUserCommand.handler(params)
            }
        }

        await PublishCommand.handler(params)

        const recipeId = await getRecipeIdFromName(projectName)

        new TemplateBuilder({distPath: buildPath, templatePath: templatesPath}).start()

        new DebugServer({port, distPath: buildPath}).start()
        const serverHost = host || internalIpV4Sync() 
        const serverUrlOpts = env == "sandbox" ? "&env=sandbox" : ""        
        qrcode.generate(`klutch://klutch/miniapps/${recipeId}?debugRecipeId=${recipeId}&debugRecipeUrl=http://${serverHost}:${port}${serverUrlOpts}`, {small: true})
    } 
}

export default DebugCommand