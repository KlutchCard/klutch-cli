import babel from "@babel/core"
import { readdir, writeFile, mkdir  }  from 'node:fs/promises'
import { readFileSync, watch } from "node:fs"
// @ts-ignore
import spread from "@babel/plugin-proposal-object-rest-spread"
// @ts-ignore
import minify from "babel-preset-minify"
// @ts-ignore
import presetReact from "@babel/preset-react"
// @ts-ignore
import asyncToPromises from "babel-plugin-transform-async-to-promises"
import { readFile  }  from 'node:fs/promises'
import Path from "path"

export interface TemplateBuilderOptions {
    distPath: string
    templatePath: string,
    debugMode?: boolean
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
        const {distPath, templatePath, debugMode} = this.config

        const fileLoc = `${templatePath}/${filename}`
        try {
            let contents = await readFile(fileLoc, 'utf8')
            contents = contents.replace(/\/\/\s*@INJECT\("(.*)"\)/gm, (match, rep) => {                
                const repContents = readFileSync(Path.resolve(`${templatePath}/${rep}`), 'utf8')
                return repContents
            })

            const presets = debugMode ? 
                [presetReact] : 
                [[minify, { "evaluate": false, "mangle": true}], presetReact]
            
            const resp = await babel.transformAsync(contents, {
                configFile: false, 
                plugins: [spread, asyncToPromises],
                presets: presets
            })
            writeFile(`${distPath}/templates/${filename.replace(/\.\w*$/gm, ".template")}`, resp?.code as string)
            console.log(`Updating Template: ${filename}`)    
        } catch (e: any) {
            console.error(e)
        }
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








