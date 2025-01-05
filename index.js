import { readFile } from 'node:fs';
import http, { createServer } from 'node:http'
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const server = createServer();

const fileUrl = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileUrl);
const filePath = path.join(__dirname, "pages", "createAccount.html")

server.on('request', (req, res)=>{
    if(req.url === '/'){
        readFile(filePath, (err, content) =>{
            if(err){
                res.writeHead(404, { 'content-type': 'text/plain' })
                res.end('file not found!')
            }
            else{
                res.writeHead(200, { 'content-type': 'text/html' })
                res.end(content)
            }
            
        });
    }
    else{
        console.log(`${req.headers.host} + ${req.url}`)
    }
});



server.listen(3000, 'localhost', ()=>{
    console.log('running of localhost:3000...')
})