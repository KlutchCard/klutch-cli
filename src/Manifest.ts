import {readFileSync} from "node:fs"


export default function (config?: string) {
    if (!config) config = 'klutch.json'
    const data = readFileSync(config, 'utf8');
    return JSON.parse(data)
}