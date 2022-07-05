import { Argv } from "yargs"

import { generateKeyPair } from "crypto"
import { writeFile  }  from 'node:fs/promises'
import Manifest from "../Manifest.js"


const GenerateKeyCommand = {
    command: "generateKey",
    describe: "Generate Keys for the miniapp",

    builder: (yargs: Argv)  => yargs,

    handler: async (params: any) => {
        const manifest = Manifest()
        generateKeyPair('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
              cipher: 'aes-256-cbc',
              passphrase: 'top secret'
            }
          }, (err, publicKey, privateKey) => {
            if (err) {
                console.error(err)
                return
            }
            console.log("A new public/private key has been generated.")
            console.log("Make sure to keep private.key safe.")
            writeFile("private.key", privateKey)
            writeFile(manifest["publicKeyFile"], publicKey)
          });
          
    } 
}

export default GenerateKeyCommand