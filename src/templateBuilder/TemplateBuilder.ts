import babel from "@babel/core"
import { readdir, writeFile, mkdir  }  from 'node:fs/promises'
import { watch } from "node:fs"
// @ts-ignore
import spread from "@babel/plugin-proposal-object-rest-spread"
// @ts-ignore
import minify from "babel-preset-minify"
// @ts-ignore
import presetReact from "@babel/preset-react"


export interface TemplateBuilderOptions {
    distPath: string
    templatePath: string
}

export default class TemplateBuilder {

    private config: TemplateBuilderOptions

    constructor(config: TemplateBuilderOptions) {
        this.config = config
        this.init()

    }

    init = async () => {

        const {distPath} = this.config

        try {
            await mkdir(`${distPath}/templates` , {recursive: true})
        } catch(e: any) {
            if (!e.code || e.code != "EEXIST") {
                throw e
            }
        }        
        

    }

    start = () => {

        this.transformAllTemplates()
        
        const { templatePath} = this.config
        
        watch(templatePath, (eventType, filename) => {
            if (filename) {
                this.transformTemplate(filename)
            } 
        });
    }

    transformTemplate = async (filename: string) => {   
        const {distPath, templatePath} = this.config
        
        const resp = await babel.transformFileAsync(`${templatePath}/${filename}`, {
            configFile: false, 
            plugins: [spread],
            presets: [[minify, { "evaluate": false, "mangle": true}], presetReact]
        })
        writeFile(`${distPath}/templates/${filename.replace(/\.\w*$/gm, ".template")}`, resp?.code as string)
        console.log(`Updating Template: ${filename}`)
    }
    
    transformAllTemplates = async () => {
        const {distPath, templatePath} = this.config
        try {
            const files = await readdir(templatePath);
            for (const file of files) {
                await this.transformTemplate(file)
            }
              
          } catch (err) {
            console.error(err);
        }
    }
}










