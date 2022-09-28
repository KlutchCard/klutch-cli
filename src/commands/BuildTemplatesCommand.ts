import { Argv } from "yargs"
import Manifest from "../Manifest.js"
import TemplateBuilder from "../templateBuilder/TemplateBuilder.js"

import { readdir }  from 'node:fs/promises'
import { AuthService, GraphQLService,  RecipeFile } from "@klutch-card/klutch-js"
import gql from "graphql-tag"
import KlutchRc from "../klutchservice/KlutchRc.js"
import {login } from "./LoginCommand.js"
import axios from "axios"
import { createReadStream,  statSync } from "node:fs"
import { readFile  }  from 'node:fs/promises'






const BuildTemplateCommand = {
    command: "build-templates",
    describe: "Build your templates",
    builder: (yargs: Argv)  => yargs,        
    handler: async (params: any) => {        
        const manifest = Manifest(params.configFile)

        let {keyfile} = params

        const token = await KlutchRc.load(params.env)

        if (!token || !(await AuthService.getAuthToken(token))) {
            const ret = await login(params)
            if (!ret) return
        }
        
        const { projectName, version } = manifest


        const {buildPath, templatesPath, screenshotsPath, iconFile} = manifest

        await new TemplateBuilder({distPath: buildPath, templatePath: templatesPath}).transformAllTemplates()


    } 
}

export default BuildTemplateCommand