import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";

const fileUrl = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileUrl);
const rootDir = path.resolve(__dirname, '..');

export async function getFileContent(fileName){
    const filePath = path.join(rootDir, "pages", fileName)
    try{
        const fileContent = await readFile(filePath, 'utf-8');
        return fileContent;
    }
    catch(err){
        console.log(`error reading file ${fileName}`,err);
        return null;
    }
}