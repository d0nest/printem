import { createServer } from "http";
import { routes } from "./routes/routes.js";
import { URL } from "url";
import { AppDataSource } from "./build/data-source.js";


let server = createServer();
export const dataSource = AppDataSource.initialize().then(()=>{
    console.log('connected to database')
})

server.on('request', (req,res)=>{
    const url = new URL('https://' + req.headers.host + req.url);
    let routeHandler = routes[req.method][url.pathname];
    
    if (url.pathname.includes('download')) {
         routeHandler = routes[req.method]['/download'];
    }
    
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