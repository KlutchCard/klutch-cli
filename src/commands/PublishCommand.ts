import { Argv } from "yargs"
import Manifest from "../Manifest.js"
import TemplateBuilder from "../templateBuilder/TemplateBuilder.js"
import tar from "tar"
import { readdir,copyFile, mkdir  }  from 'node:fs/promises'
import { AuthService, GraphQLService, Recipe } from "@klutch-card/klutch-js"
import gql from "graphql-tag"
import KlutchRc from "../klutchservice/KlutchRc.js"
import LoginCommand from "./LoginCommand.js"
import axios from "axios"
import { createReadStream, statSync } from "node:fs"
import FormData  from "form-data"



const uploadFile = async (projectName: string, version: number, filename: string) => {
    
    const resp = await GraphQLService.query(gql`
        query($projectName: String, $version: Int) {
            developer {
                uploadRecipe(projectName: $projectName, version: $version) 
            }
        }
    `, {projectName, version})
    const url = resp.developer.uploadRecipe   
    const stream = createReadStream(filename)
    stream.on('error', console.log)
    const {size} = statSync(filename) 
    const uploaded = await axios({
        url: url,
        method: "PUT",
        headers: {
            "Content-Type": "application/tar+gzip",
            "Content-Length": size
        },
        data: stream})
    const confirm = await GraphQLService.query(gql`
        query($projectName: String, $version: Int) {
            developer {
                uploadRecipe(projectName: $projectName, version: $version) 
            }
        }
    `, {projectName, version})
}


const PublishCommand = {
    command: "publish",
    describe: "Publish your miniapp to our sandbox environment",

    builder: (yargs: Argv)  => yargs,

    handler: async (params: any) => {        
        const manifest = Manifest()

        const token = await KlutchRc.load()
        if (!token || !AuthService.getAuthToken(token)) {
            await LoginCommand.handler(null)
        }
        

        const { projectName, version } = manifest


        const {buildPath, templatesPath, screenshotsPath, iconFile} = manifest

        await new TemplateBuilder({distPath: buildPath, templatePath: templatesPath}).transformAllTemplates()

        console.log("Preparing upload package...")

        mkdir(`${buildPath}/images/screenshots`, {recursive: true})

        await copyFile("klutch.json", `${buildPath}/klutch.json`)
        await copyFile(iconFile, `${buildPath}/images/icon.png`)
        const screenshotFiles = await readdir(screenshotsPath)
        for (const file of screenshotFiles) {
            await copyFile(`${screenshotsPath}/${file}`, `${buildPath}/images/screenshots/${file}`)
        }



        const files = await readdir(buildPath)

        const filename = `${manifest.buildPath}/${manifest.projectName}.tgz`

        await tar.create({
            gzip: true,
            cwd: buildPath,
            filter: (path) => !path.endsWith(".tgz"),
            file: filename
          }, files)
        
        console.log("uploading package to server...")

        await uploadFile(projectName, +version, filename)
        console.log("done!")
    } 
}

export default PublishCommand