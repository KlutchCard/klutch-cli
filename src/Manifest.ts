import {readFileSync} from "node:fs"


export default function () {
    const data = readFileSync('klutch.json', 'utf8');
    return JSON.parse(data)
}