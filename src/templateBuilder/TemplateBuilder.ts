import babel from "@babel/core"
import { readdir, writeFile, mkdir  }  from 'node:fs/promises'
import { watch } from "node:fs"
// @ts-ignore
import spread from "@babel/plugin-proposal-object-rest-spread"
// @ts-ignore
import minify from "babel-preset-minify"
// @ts-ignore
import presetReact from "@babel/preset-react"
// @ts-ignore
import asyncToPromises from "babel-plugin-transform-async-to-promises"

import webpack from 'webpack';
import path from "path"
import {resolve} from 'import-meta-resolve'

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
        
        try {

            webpack({
                name: "test-config",
                mode: "development",
                entry: "./templates/Main.jsx",    
                output: {
                    path: path.resolve(distPath),
                    filename: "[name].jsx"
                },
                module: {
                  rules: [
                    {
                        loader: await resolve("babel-loader", import.meta.url),
                        options: {
                            configFile: false,
                            presets: [presetReact],
                            plugins: [spread, asyncToPromises]
                        }
                    }
                  ]    
                },
                resolve: {
                    extensions: [".js", ".jsx"]
                }
            }, (err, stats)=> {
                console.log("ERR", err)
                console.log("ERRORS", stats?.toJson('minimal'))
                //console.log("STATS", stats)
            })

            const presets = debugMode ? 
                [presetReact] : 
                [[minify, { "evaluate": false, "mangle": true}], presetReact]

/*             const resp = await babel.transformFileAsync(`${templatePath}/${filename}`, {
                configFile: false, 
                plugins: [spread, asyncToPromises],
                presets: presets
            })
            writeFile(`${distPath}/templates/${filename.replace(/\.\w*$/gm, ".template")}`, resp?.code as string)
 */            console.log(`Updating Template: ${filename}`)    
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










