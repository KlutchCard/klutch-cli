import express from "express"
import crypto from "crypto"
import {  stat, readFile  } from "node:fs/promises"
import { watch } from "node:fs"
import { readdir }  from 'node:fs/promises'
import chokidar from 'chokidar';
import { resolve } from 'path';
import http  from "http";
import { WebSocketServer } from 'ws';
export interface ServerOptions {
    port: number
    distPath: string
}

export default class DebugServer {
    private app = express()


    private options: ServerOptions



    constructor(options: ServerOptions) {
        this.options = options        
        
        const {distPath} = options
        
   

    }
        

    start = () => {
        const {port, distPath}  = this.options
        const wss = new WebSocketServer({ port });
        
        
        wss.on("connection", function connection(ws) {

            const watcher = chokidar.watch(`${distPath}/**/*.template`, {persistent: true, ignoreInitial: true, })
            watcher.on("change", async (p) => {
                console.log('changed :>> ', p);
                const contents = await readFile(p, 'utf8')
                let pathName = p.replaceAll("\\", "/")                
                pathName = pathName.substring(pathName.indexOf("/"))
                ws.send(JSON.stringify({filename: pathName, template: contents}))
            })   


            ws.on('message', async function message(data) {      
                const filename = data.toString()
                console.log("Requested file: " + filename)
                const path = `${distPath}${filename}`
                const contents = await readFile(path, 'utf8')
                ws.send(JSON.stringify({filename, template: contents}))
            }) 
            
            ws.on('close', function close() {
                watcher.close()
            })
                    
        })
        
    }
}














