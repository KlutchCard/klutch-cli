import { Argv } from "yargs"
import CreateTestUserCommand from "./CreateTestUserCommand.js"
import ListTestUserCommand from "./ListTestUserCommand.js"

const TestUserCommand = {
    command: "test-users",
    describe: "Test user Commands",

    builder: (yargs: Argv)  => yargs
        .command(CreateTestUserCommand)
        .command(ListTestUserCommand),
    handler: async (params: any) => {        
    } 
}

export default TestUserCommand