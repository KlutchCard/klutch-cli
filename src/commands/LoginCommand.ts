import inquirer from "inquirer"
import { Argv } from "yargs"


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

const LoginCommand = {
    command: "login",
    describe: "Logs you in as a developer",

    builder: (yargs: Argv)  => yargs
        .option("u", {alias: "username", type: 'string'})
        .option("p", {alias: "password",  type: "string"}),

    handler: async (params: any) => {
        
        const answers = await inquirer.prompt(questions, params)
        
    } 
}

export default LoginCommand