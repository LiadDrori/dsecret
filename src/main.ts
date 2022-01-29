#!/usr/bin/env node


import {registerPrompt , prompt} from "inquirer";
import {decodeSecret, getContexts, getCurrentContext, getNamespaces, getSecrets} from './kubectl'

registerPrompt('search-list', require('inquirer-search-list'));
const inquirerSearchList = 'search-list' as any;



async function main() {
    const currentContext = await getCurrentContext();
    const contexts = await getContexts();
    const defaultIndex =contexts.findIndex((c) => c ==currentContext);
    const {context} = await 
                    prompt({name: "context" ,
                                     type: 'list' , 
                                     default: defaultIndex, 
                                     message: "Choose context",
                                    choices: contexts,
                                suffix: ` default (current - ${currentContext})`})    
    const namespaces = await getNamespaces(context);
    const {namespace} =await  prompt({name :"namespace" ,type: 'list' , message: "Choose namespace" , choices: namespaces  , default: 'default'})
    const secrets =await  getSecrets(namespace , context);    
    const {secret} = await prompt({name: "secret" , type: inquirerSearchList , choices: secrets , message: "Choose secret"});
    const decodedSecret = await decodeSecret(secret , namespace, context);
    Object.keys(decodedSecret).forEach((key) => {
        console.log(`${key}= ${decodedSecret[key]}`);
    });
    
}

try{
    main();

}catch(e){
    console.error('error while running cli');
    console.error(e)
    process.exit(1);
    
}

