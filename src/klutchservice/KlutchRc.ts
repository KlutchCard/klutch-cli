

import { writeFile,readFile  }  from 'node:fs/promises'

export default {
    async save(refreshToken: string, env?: string) {
        let file = "./.klutchrc"
        if (env) {
            file = `./.klutchrc-${env}`
        }
        await writeFile(file, JSON.stringify({refreshToken: refreshToken}))
    },
    async load(env?: string) {
        try {
            let fileName = "./.klutchrc"
            if (env) {
                fileName = `./.klutchrc-${env}`
            }
    
            const file = await readFile(fileName, 'utf8')
            return JSON.parse(file).refreshToken    
        } catch (e) {
            return null
        }
    },
}