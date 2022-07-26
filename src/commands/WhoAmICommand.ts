import { GraphQLService } from "@klutch-card/klutch-js"
import gql from "graphql-tag"
import { Argv } from "yargs"


const WhoAmICommand = {
    command: "WhoAmI",
    describe: "Developer data",

    builder: (yargs: Argv) => yargs,

    handler: async (params: any) => {
        const resp = await GraphQLService.mutation(gql`
          query {
            developer {
              id
              firstName
              lastName
              email
            }
          }
        `, {})
        console.log(resp.developer)
    }
}

export default WhoAmICommand
