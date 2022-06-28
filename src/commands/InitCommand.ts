import {  Argv } from "yargs"
import inquirer from 'inquirer';

import { cp, writeFile, mkdir  }  from 'node:fs/promises'
import * as path from "node:path"

const questions = [
    {
        type: "input",
        name: "projectName",
        message: "What's your Miniapp Project name?",
        validate: function(input: string) {
            if (/^[A-Za-z][-_0-9A-Za-z]{2,20}$/.test(input)) {
                return true
            }
            return "Project name must start with a letter, have between 3 and 20 chars and contain only letters, numbers, -, _"
        },        
    }, 
    {
        type: "input",
        message: "What's your Miniapp name?",
        name: "name",
        validate: function(input: string) {
            if (input == null || input.length < 3 || input.length > 20) {
                return "MiniApp name must have between 3 and 20 chars"
            }
            return true
        },        
    }, 
    {
        type: "input",
        message: "Description",
        name: "description",
        validate: function(input: string) {
            if (!input || input.length == 0) {
                return true
            }
            if (input == null || input.length < 15 || input.length > 255) {
                return "Descriptions must have between 15 and 150 chars"
            }
            return true
        }
    },
    {
        type: "input",
        message: "Long Description",
        name: "longDescription",
        validate: function(input: string) {
            if (!input || input.length == 0) {
                return true
            }
            if (input.length < 15 || input.length > 500) {
                return "Descriptions must have between 15 and 500 chars"
            }
            return true
        }
    },
    {
        type: "input",
        message: "Server URL",
        name: "serverUrl",
        validate: function(input: string) {
            if (!input || input.length == 0) {
                return true
            }
            if (/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(input)) {
                return true
            }
            return "Invalid URL -- Server URL must start with https"
        }
    },
]

async function createFileStructure(answers: any) {

    const {projectName} = answers

    const newDir: string = await mkdir(`./${projectName}`, {recursive: true}) || `./${projectName}`
    
    const manifest = {
        version: "1.0.0",
        visibility: "PUBLIC",
        iconFile: "./images/icon.png",
        screenShotPattern: "./images/screenshots/*.png",
        templatesPattern: "./templates/*.jsx",
        privateKeyFile: `./${projectName}.key`,
        minimumKlutchVersion: "1.0.0",
        ...answers}

    writeFile(`${newDir}/klutch.json`, JSON.stringify(manifest, null, 4))

    const [, thisFile] = process.argv    
    var thisDir = path.dirname(thisFile)
    cp(`${thisDir}/../assets`, newDir, {recursive: true})
        
}

 const InitCommand =  {
    command: "init",
    describe: "Creates a blank miniapp template",

    builder: (yargs: Argv)  => yargs,

    handler: async () => {
        
        process.stdout.write("Welcome to Klutch. We will help you create a miniapp template. You can edit your configurations on the klutch.json file\n\n")
        const answers = await inquirer.prompt(questions)
        createFileStructure(answers)
        
    } 
}

export default InitCommand