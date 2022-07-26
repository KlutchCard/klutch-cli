import { AuthService, GraphQLService } from "@klutch-card/klutch-js"
import gql from "graphql-tag"
import { Argv } from "yargs"
import KlutchRc from "../../klutchservice/KlutchRc.js"
import { login } from "../LoginCommand.js"


export const listUsers = async () => {
    const resp = await GraphQLService.query(gql`
    query {
        developer {
            listTestUsers {
                    id
                    firstName
                    lastName
                    email
                }
            }
        }   
    `) 
    return resp.developer.listTestUsers
}

const ListTestUserCommand = {
    command: "list",
    describe: "List Test Users",

    builder: (yargs: Argv)  => yargs,

    handler: async (params: any) => {        

        const token = await KlutchRc.load()


        if (!token || !(await AuthService.getAuthToken(token))) {
            const ret = await login(null)
            if (!ret) return
        }
                    
        console.log(await listUsers())
    } 
}

export default ListTestUserCommand