import { createServer } from "http";
import { routes } from "./routes/routes.js";
import { AppDataSource } from './build/data-source.js'
import { URL } from "url";

let server = createServer()
export const dataSource = AppDataSource.initialize();

server.on('request', (req,res)=>{
    const url = new URL('https://' + req.headers.host + req.url); 

    const routeHandler = routes[req.method][url.pathname];
    if(routeHandler){
        routeHandler(req,res);
    }
    else{
        res.end('404')
    }
})

server.listen(3000, 'localhost', ()=>{
    console.log('listening on localhost:3000')
})