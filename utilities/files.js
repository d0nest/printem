import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

export function getRootDir(){
    const fileUrl = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(fileUrl);
    return path.resolve(__dirname, '..');    
}


export async function getFileContent(fileName){
    const filePath = path.join(getRootDir(), "pages", fileName)
    try{
        const fileContent = await readFile(filePath, 'utf-8');
        return fileContent;
    }
    catch(err){
        console.log(`error reading file ${fileName}`,err);
        return null;
    }
}

export function moveFile(files){

}
