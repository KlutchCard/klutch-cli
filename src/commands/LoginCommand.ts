import  {AuthService} from "@klutch-card/klutch-js"
import inquirer from "inquirer"
import { Argv } from "yargs"
import KlutchRc from "../klutchservice/KlutchRc.js"


const questions  = [
    {
        type: "input",
        name: "username",
        message: "Username"
    },
    {
        type: "password",
        name: "password",
        message: "Password"
    }
]

export const login  = async (params: any) => {
    const answers = await inquirer.prompt(questions, params)
    try {
        const resp = await AuthService.signIn(answers.username, answers.password)
        KlutchRc.save(resp.RefreshToken, params.env)            
        return true

    } catch (e: any) {
        console.log(e.message)
        return false
    }
}

const LoginCommand = {
    command: "login",
    describe: "Logs you in as a developer",

    builder: (yargs: Argv)  => yargs
        .option("u", {alias: "username", type: 'string'})
        .option("p", {alias: "password",  type: "string"}),

    handler: async (params: any) => {
        await login(params)
    } 
}

export default LoginCommand