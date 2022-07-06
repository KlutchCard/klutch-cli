import { AuthService, GraphQLService } from "@klutch-card/klutch-js"
import gql from "graphql-tag"
import inquirer from "inquirer"
import { Argv } from "yargs"
import KlutchRc from "../../klutchservice/KlutchRc.js"
import Manifest from "../../Manifest.js"
import  { login } from "../LoginCommand.js"


const questions =  [
    {
        type: "input",
        name: "firstName",
        message: "Sandbox user firstName",
        validate: function(input: string) {
            if (/^[A-Za-z]{3,}$/.test(input)) {
                return true
            }
            return "First Name needs to be more than 3 chars "
        }
    },
    {
        type: "input",
        name: "lastName",
        message: "Sandbox user lastName",
        validate: function(input: string) {
            if (/^[A-Za-z]{3,}$/.test(input)) {
                return true
            }
            return "Last Name needs to be more than 3 chars "
        }        
    },
    {
        type: "email",
        name: "email",
        message: "Sandbox user email",
        validate: function(input: string) {
            if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(input)) {
                return true
            }
            return "Email is invalid"
        }
    },
    {
        type: "password",
        name: "password",
        message: "Sandbox user password",
        validate: function(input: string) {
            if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}.*$/.test(input)) {
                return true
            }
            return "Password must contain 8 chars, 1 upper, 1 lower and 1 number"
        }
    }
]
const CreateTestUserCommand = {
    command: "create",
    describe: "Creates a sandbox test user",

    builder: (yargs: Argv)  => yargs
        .option("firstName", {describe: "Sandbox user first name"})
        .option("lastName", {describe: "Sandbox user last name"})
        .option("email", {describe: "Sandbox user email"})
        .option("password", {describe: "Sandbox user password"}),

    handler: async (params: any) => {        
        const manifest = Manifest(params.configFile)

        const token = await KlutchRc.load()

        const answers = await inquirer.prompt(questions, params)
        
        const {firstName, lastName, email, password} = answers

        if (!token || !(await AuthService.getAuthToken(token))) {
            const ret = await login(null)
            if (!ret) return
        }
        const resp = await GraphQLService.mutation(gql`
            mutation($firstName: String, $lastName: String, $email: String, $password: String) {
                developer {
                    createTestUser(firstName: $firstName, lastName: $lastName, email: $email, password: $password) {
                        id
                        email
                    }
                }
            }
        `, {firstName, lastName, email, password})
        console.log(`Created Test user ${resp.developer.createTestUser.id}`)                
    } 
}

export default CreateTestUserCommand