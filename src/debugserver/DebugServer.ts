import express from "express"
import crypto from "crypto"
import {  stat, readFile  } from "node:fs/promises"
import { watch } from "node:fs"


export interface ServerOptions {
    port: number
    distPath: string
}

export default class DebugServer {
    private app = express()

    private options: ServerOptions

    constructor(options: ServerOptions) {
        this.options = options
        this.setRoutes()
    }


    sendFile = async (res: any , filename: string) => {
        const contents = await readFile(filename, 'utf8')
        const hashSum = crypto.createHash('sha256');
        hashSum.update(contents);
        const hex = hashSum.digest('hex');
        res.statusCode = 200;
        res.setHeader('Content-type', 'text/plain; charset=utf-8')
        res.setHeader('Transfer-Encoding', 'chunked')
        res.setHeader('ETag', hex)    
        res.send(contents)
    }

    setRoutes = () => {
        this.app.get('/*', async (req, res) => {    
            const templateName = req.url
            const {distPath} = this.options

            const filename = `${distPath}${templateName}`
            console.log(`Fetching  ${filename}` )
            try {
                const fsStat = await stat(filename)
                if (!fsStat.isFile) {
                    res.status(404).send("{error: 'Not found'}")
                    return
                }
            } catch (e: any) {
                if (e.code === "ENOENT") {
                    res.status(404).send("{error: 'Not found'}")
                    return            
                }        
            }    
            try {
                const currentEtag = req.headers.etag
        
                const contents = await readFile(filename, 'utf8')
                const hashSum = crypto.createHash('sha256');
                hashSum.update(contents);
                const hex = hashSum.digest('hex');
            
                
                
                if (currentEtag != hex) {
                    await this.sendFile(res, filename)
                } else {
                    var sent = false
                    watch(filename, {persistent: false} ,  async () => {
                        if (!sent) {
                            sent = true
                            this.sendFile(res, filename)
                        }        
                    })        
                }
            } catch (e) {
                console.error(e)
                res.end()
            }
        })
    }
     
    

    start = () => {
        const {port}  = this.options
        this.app.listen(port, () => {
            console.log(`Miniapp Debugger listening on port:  ${port}`)
        })  
    }
}














