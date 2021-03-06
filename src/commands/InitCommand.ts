import {  Argv } from "yargs"
import inquirer from 'inquirer';

import { writeFile, mkdir  }  from 'node:fs/promises'
import { createWriteStream } from "node:fs";
import axios from "axios";
import GenerateKeyCommand from "./GenerateKey.js";

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
        message: "Short Description",
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

const filesToDownload = [
    {url: "https://raw.githubusercontent.com/KlutchCard/klutch-cli/main/assets/templates/Home.jsx",
    filename: "templates/Home.jsx"},
    {url: "https://raw.githubusercontent.com/KlutchCard/klutch-cli/main/assets/templates/Main.jsx",
    filename: "templates/Main.jsx"},
    {url: "https://raw.githubusercontent.com/KlutchCard/klutch-cli/main/assets/templates/Transaction.jsx",
    filename: "templates/Transaction.jsx"},
    {url: "https://raw.githubusercontent.com/KlutchCard/klutch-cli/main/assets/images/icon.png",
    filename: "images/icon.png"},
    {url: "https://raw.githubusercontent.com/KlutchCard/klutch-cli/main/assets/images/screenshots/screenshot1.png",
    filename: "images/screenshots/screenshot1.png"},
    {url: "https://raw.githubusercontent.com/KlutchCard/klutch-cli/main/assets/.gitignore",
    filename: ".gitignore"},
]


function downloadFile(fileUrl: string, outputLocationPath: string) {
    const writer = createWriteStream(outputLocationPath);
  
    return axios({
      method: 'get',
      url: fileUrl,
      responseType: 'stream',
    }).then(response => {  
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error: any = null;
        writer.on('error', err => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on('close', () => {
          if (!error) {
            resolve(true);
          }
        });
      });
    });
  }

async function createFileStructure(answers: any) {

    const {projectName} = answers

    const newDir: string = await mkdir(`./${projectName}`, {recursive: true}) || `./${projectName}`
    const templatesDir = await mkdir(`${newDir}/templates`, {recursive: true}) 
    const imagesDir = await mkdir(`${newDir}/images/screenshots`, {recursive: true}) 

    const manifest = {
        version: 1,
        visibility: "PUBLIC",
        iconFile: "./images/icon.png",
        screenshotsPath: "./images/screenshots",
        templatesPath: "./templates",
        buildPath: "./dist",
        publicKeyFile: `./${projectName}.pem`,
        minimumKlutchVersion: "1.0.0",        
        webhookConfiguration: {
            webhookUrl: "https://<<MY WEBHOOK URL>>",
            events: [
                "com.alloycard.core.entities.transaction.TransactionUpdatedEvent",
                "com.alloycard.core.entities.transaction.TransactionReversedEvent",
                "com.alloycard.core.entities.transaction.TransactionCreatedEvent"
            ]
        },
        ...answers}

    await writeFile(`${newDir}/klutch.json`, JSON.stringify(manifest, null, 4))

    filesToDownload.forEach(e => {
        downloadFile(e.url, `${newDir}/${e.filename}`)
    })
        
}

 const InitCommand =  {
    command: "init",
    describe: "Creates a blank miniapp template",

    builder: (yargs: Argv)  => yargs
    .option("projectName", {describe: "Mini App Project Name", type: 'string'})
    .option("name", {describe: "Mini App name", type: 'string'})
    .option("description", {describe: "Mini App Description", type: "string"})
    .option("longDescription", {describe: "Mini App Long Description"})        
    .option("serverUrl", {describe: "Server URL", type: "string"}),

    handler: async (params: any) => {
        process.stdout.write("Welcome to Klutch. We will help you create a miniapp template. You can edit your configurations on the klutch.json file\n\n")
        const answers = await inquirer.prompt(questions, params)
        const {projectName, name, description, longDescription, serverUrl} = answers
        await createFileStructure({projectName, name, description, longDescription, serverUrl })                   
        await GenerateKeyCommand.handler({
            configFile: `${projectName}/klutch.json`, 
            privateKeyFile: `${projectName}/private.key`,
            publicKeyFile: `${projectName}/${projectName}.pem`})     
    } 
}

export default InitCommand
