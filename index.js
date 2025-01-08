import { createServer } from "http";
import { routes } from "./routes/routes.js";
import { AppDataSource } from './build/data-source.js'

let server = createServer()
export const dataSource = AppDataSource.initialize();

server.on('request', (req,res)=>{
    const routeHandler = routes[req.method][req.url];
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