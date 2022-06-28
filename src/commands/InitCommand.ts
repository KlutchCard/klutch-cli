import {  Argv } from "yargs"
import inquirer from 'inquirer';

import { writeFile, mkdir  }  from 'node:fs/promises'
import copy from "copy"
import * as path from "node:path"
import { createWriteStream } from "node:fs";
import axios, { Axios } from "axios";

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
  
      //ensure that the user can call `then()` only when the file has
      //been downloaded entirely.
  
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
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
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
        version: "1.0.0",
        visibility: "PUBLIC",
        iconFile: "./images/icon.png",
        screenShotPattern: "./images/screenshots/*.png",
        templatesPattern: "./templates/*.jsx",
        privateKeyFile: `./${projectName}.key`,
        minimumKlutchVersion: "1.0.0",
        ...answers}

    writeFile(`${newDir}/klutch.json`, JSON.stringify(manifest, null, 4))

    filesToDownload.forEach(e => {
        downloadFile(e.url, `${newDir}/${e.filename}`)
    })
        
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