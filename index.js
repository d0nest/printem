import http, { createServer } from 'node:http'

const server = createServer();

server.on('request', (req, res)=>{
    res.writeHead(200, {'content-type': 'text/plain'})
    res.end('hey, there!')
});



server.listen(3000, 'localhost', ()=>{
    console.log('running of localhost:3000...')
})