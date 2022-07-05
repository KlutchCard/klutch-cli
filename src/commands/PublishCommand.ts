import { Argv } from "yargs"
import Manifest from "../Manifest.js"
import TemplateBuilder from "../templateBuilder/TemplateBuilder.js"
import tar from "tar"
import { readdir,copyFile, mkdir  }  from 'node:fs/promises'
import { AuthService, GraphQLService, Recipe, RecipeFile } from "@klutch-card/klutch-js"
import gql from "graphql-tag"
import KlutchRc from "../klutchservice/KlutchRc.js"
import LoginCommand from "./LoginCommand.js"
import axios from "axios"
import { createReadStream, statSync } from "node:fs"
import FormData  from "form-data"




const uploadRecipe = async (manifest: any, files: Array<String>): Promise<RecipeFile[]> => {
    const resp = await GraphQLService.mutation(gql`
        mutation($manifest: JsonString, $files: [String]) {
            developer {
                uploadRecipe(manifest: $manifest, files: $files) {
                    url
                    fileName
                    eTag
                }
            }
        }
    `, {manifest: JSON.stringify(manifest), files})

    return resp.developer.uploadRecipe
}

const uploadFile = async (url: string, filename: string) => {
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
}


const PublishCommand = {
    command: "publish",
    describe: "Publish your miniapp to our sandbox environment",

    builder: (yargs: Argv)  => yargs,

    handler: async (params: any) => {        
        const manifest = Manifest()

        const token = await KlutchRc.load()

        if (!token || !(await AuthService.getAuthToken(token))) {
            await LoginCommand.handler(null)
        }
        

        const { projectName, version } = manifest


        const {buildPath, templatesPath, screenshotsPath, iconFile} = manifest

        await new TemplateBuilder({distPath: buildPath, templatePath: templatesPath}).transformAllTemplates()

        const fileList:Array<String> = []

        fileList.push("/images/icon.png")
        const templateFiles = await readdir(`${buildPath}/templates`)
        templateFiles.forEach(e => fileList.push(`/templates/${e}`))

        const screenshotFiles = await readdir(`${screenshotsPath}`)

        screenshotFiles.forEach(p => fileList.push(`/images/screenshots/${p}`))

        const filesToUpload = await uploadRecipe(manifest, fileList)

        //icon
        const icon = filesToUpload.find((i: RecipeFile) => i.fileName == "/images/icon.png")
        icon && uploadFile(icon.url, manifest.iconFile)

        //templates
        filesToUpload.filter(i => i.fileName.startsWith("/templates")).forEach(f => {
            uploadFile(f.url, `${buildPath}/${f.fileName}`)
        })

        //screenshots
        filesToUpload.filter(i => i.fileName.startsWith("/images/screenshots")).forEach(f => {
            uploadFile(f.url, `${screenshotsPath}/${f.fileName.substring(19)}`)
        })

    } 
}

export default PublishCommand