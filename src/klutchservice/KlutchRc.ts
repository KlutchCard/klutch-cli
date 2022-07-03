

import { writeFile,readFile  }  from 'node:fs/promises'

export default {
    async save(refreshToken: string) {
        await writeFile("./.klutchrc", JSON.stringify({refreshToken: refreshToken}))
    },
    async load() {
        try {
            const file = await readFile("./.klutchrc", 'utf8')
            return JSON.parse(file).refreshToken    
        } catch (e) {
            return null
        }
    },
}