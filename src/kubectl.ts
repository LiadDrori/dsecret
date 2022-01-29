import { exec } from "child_process";

export function kubectl(command: string) : Promise<string> {
    return new Promise((resolve , reject) =>{
        exec(`kubectl ${command}`, (err , stdout , stderr) => {
            if(err) {
                return reject(stderr);
            };
            return resolve(stdout);
        })
    })
}

function isNonEmptyString(str: string){ 
    if(str === '' || str == '' || str === null || str === undefined) return false;
    return true;
}
function removeResourceId(str: string) {
    return str.split('/')[1];
}
export async function getNamespaces(context: string): Promise<string[]> {
    const result = await kubectl(`get namespaces --context ${context} -o name`);
    return result.split("\n").filter(isNonEmptyString).map(removeResourceId);
}

export async function getCurrentContext() {
    return (await kubectl('config current-context')).trim();
}

export async function getContexts() {
    const result = await kubectl('config get-contexts -o name');
    return result.split('\n').slice(0,-1)
}


export async function getSecrets(namespace: string , context: string) {
    const result = await kubectl(`get secrets --context ${context} -n ${namespace} -o name`);
    return result.split("\n")
            .filter(isNonEmptyString)
            .map(removeResourceId);
}


export async function decodeSecret(secretName: string , namespace : string , context: string): Promise<{[key: string] : string}> {
    const result  = await kubectl(`get secrets ${secretName} --context ${context} -n ${namespace} -o json`);
    const data  = JSON.parse(result).data;
    return Object.entries(data).reduce((obj , [key , value] , index) => {
        return {
            ...obj,
            [key]: decodeBase64(value as string)
        }
    } , {})
     
}

function decodeBase64(base64: string) {
    return Buffer.from(base64 , 'base64').toString("utf-8");
}