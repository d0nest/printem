import path from 'path';
import { fileURLToPath } from 'url';
import { createReadStream, readFile, rename } from 'fs';
import formidable from 'formidable';
import { compareThem, hashIt } from '../utilities/bcrypt.js';
import * as jwt from '../utilities/jwt.js'
import { getFileContent, getRootDir } from '../utilities/files.js';
import {User} from '../build/entity/User.js'
import { Document } from '../build/entity/Documents.js';

const fileUrl = fileURLToPath(import.meta.url);
const __dirname = path.dirname(fileUrl);
const rootDir = path.resolve(__dirname, '..');
const filePath = path.join(rootDir, "pages", "createAccount.html")

const form = formidable();


export const routes = {
    'GET': {
        '/': (req,res)=>{
            readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404, { 'content-type': 'text/plain' })
                    res.end('file not found!')
                }
                else {
                    res.writeHead(200, { 'content-type': 'text/html' })
                    res.end(content)
                }
            });
        },
        
        '/login': async (req, res) => {
            try {
                const content = await getFileContent('login.html')
                res.writeHead(200, {'content-type': 'text/html'});
                res.end(content)
            }
            catch (error){
                console.error('error reading file', error);;
            }
        },
        
        '/dashboard':async (req,res)=>{
            // console.log(req.getHeader('cookie'))
            const cookie = req.headers['cookie'];
            if(!cookie || cookie === undefined){
                res.writeHead(403, 'unauthorized');
                res.end('go to login page')
            }
            else{
                const sliced = cookie.slice(cookie.indexOf('=') + 1)
                try {
                    const letEmGo = await jwt.verifyA(sliced);
                    const content = await getFileContent('dashboard.html')
                    console.log(letEmGo)

                    res.setHeader('content-type', 'text/html');
                    res.writeHead(200, { 'username': letEmGo.username })
                    res.end(content)
                }
                catch (error) {
                    console.log(error);
                    res.writeHead(403, 'token expired!');
                    const content = await getFileContent('login.html')
                    res.end(content)
                }   
            }
        },
        '/dashboard/data': async (req,res)=>{
            const query = new URL(req.url, 'http://localhost').searchParams;
            console.log(query)
            const offset = query.get('offset');
            const limit = query.get('limit');
            
            console.log(offset, limit);
            const cookie = req.headers['cookie'];
            if(!cookie){
                res.writeHead(403, 'unable to fetch data, no access_token provided');
                res.end('no access token found');
            }
            
            const sliced = cookie.slice(cookie.indexOf('=') + 1)
            const user = await jwt.verifyA(sliced);
            const documents = await Document.bringLimitedDocumentsFromUser(offset, limit, user.username)
            res.writeHead(200, 'user data!', { 'content-type': 'application/json' })
            res.end(JSON.stringify(documents));
            
            // console.log(u);

            // if(u.document !== undefined){
            //     for (let d of u.document) {
            //         dString += d.originalFilename + '\n';
            //     }
            // }
            //show data here
        },
        '/download': async(req,res)=>{
            const readStream = createReadStream(path.join(getRootDir(), 'files', req.url.slice(10)));
            readStream.on('open', ()=>{
                res.writeHead(200, {'content-type': 'application/octet-stream'})
                readStream.pipe(res);
            })
        },
        '/upload/documents': async (req, res) =>{
            // const url = new URL('http://' + req.headers.host + req.url);
            
            // const user = url.searchParams.get('username');
            
            try{
                const file = await getFileContent('uploadDocuments.html');
                // res.setHeader('url', `/upload/documents?username=${user}`)
                res.writeHead(200,"upload?");
                res.end(file);
            }
            catch(error){
                console.log('error reading upload docs file', error);
            }
        }
    },
    'POST': {
        '/upload/documents/data': async (req, res)=>{
            try{
                // const user = await User.findUser(req.headers.user);
                const user = await User.findOne({where: {username: req.headers.user}, relations: ['document']})
                if(user){
                    console.log(`store documents for sir ${req.headers.user}`)
                    form.parse(req, (err, fields, files) => {
                        if (err) {
                            res.writeHead(333, 'error parsing files!');
                            res.end('internal server error');
                        }
                        else {
                            for(let i = 0 ; i < files.files.length; i++){
                                const newPath = path.join(getRootDir(), 'files', files.files[i].originalFilename)
                                rename(files.files[i].filepath, newPath, async (err)=>{
                                    if(err){
                                        console.log('error saving files to other location',err)
                                    }
                                    else{
                                        console.log('file is saved to a safe vault!')
                                        // console.log(files.files[i].originalFilename)
                                        // console.log(`${files.files[i].originalFilename} ${files.files[i].newFilename}}`)
                                        const document = new Document()
                                        
                                        document.originalFilename = files.files[i].originalFilename;
                                        document.newFilename = files.files[i].newFilename;
                                        document.mimeType = files.files[i].mimetype;
                                        document.size = files.files[i].size;
                                        document.filePath = newPath;
                                        document.user = user;
                                        try{
                                            const savedDoc = await Document.save(document)
                                            if(user.document === undefined){
                                                user.document = [];
                                            }
                                            user.document.push(savedDoc);
                                            
                                            const updatedUser = await User.save(user);
                                            console.log('user has documents', updatedUser);
                                            console.log('user from database:', await User.find({relations: ['document']}))
                                            // console.log('document', await Document.find({relations: ['user']}))
                                            res.writeHead(200, 'uploaded successfully');
                                            res.end();
                                        }
                                        catch(err){
                                            console.log(err);
                                            res.writeHead(333,'upload failed!')
                                            res.end();
                                        }
                                        // console.log(files.files[i])
                                    }
                                })
                                files.files[i].filepath = getRootDir() + 'files'
                                console.log(files.files[i].filepath)
                            }
                        }
                    })
                }
                else{
                    res.writeHead(333, 'user not found to upload documents')
                    res.end('user not found to upload documents!')
                    console.log('user not found to upload documents')
                }
            }
            catch(err){
                console.log('error', err);
            }                
        },
        
        '/create/account':  (req, res)=>{
            try{
                form.parse(req, async (err, fields, files) => {
                    if (err) {
                        res.writeHead(404, { 'content-type': 'text/plain' })
                        res.end('no form data was found!')
                    }
                    else {
                        try{
                            const count = await User.findByUsername(fields.username[0])
                            if (count === 0) {
                                try{
                                    let user = new User();
                                    const hash = await hashIt(fields.password[0])
                                    user.username = fields.username[0];
                                    user.password = hash;
                                    user.document = [];
                                    let created = await User.save(user)
                                    console.log(created)
                                    if (created) {
                                        try {
                                            const token = await jwt.generateAR({ userid: created.userid, username: created.username });
                                            res.setHeader('Set-Cookie', `user=${token.access_token}; path=/; Secure; SameSite=Lax`)
                                            res.writeHead(200, {'content-type': 'text/plain'})
                                            res.end('user is created!')
                                        }
                                        catch (err) {
                                            console.log('unable to generate tokens!')
                                        }
                                    }
                                }
                                catch(err){
                                    console.log('error hashing', err);
                                }
                            }
                            else {
                                res.writeHead(333, 'username is taken!', {'content-type': 'text/plain'});
                                console.log('username is taken!')
                                res.end('username is taken!');
                            }
                        }
                        catch(err){
                            console.error('error findingUserByUsername', err);
                        }
                    }
                })
            }
            catch(error){
                console.error('error parsing form', error)
            }
        },
       
        '/login/user': (req,res)=>{
            try{
                form.parse(req, async (err, fields, files)=>{
                    if(err){
                        console.error('error in parsing form', err);
                        res.writeHead(500, 'internal server error');
                        res.end('unable to login at the moment');
                    }
                    try{
                        const user = await User.findUser(fields.username[0]);
                        if(user){
                            const passMatch = await compareThem(fields.password[0], user.password);
                            if(passMatch){
                                try{
                                    const token = await jwt.generateAR({userid: user.userid, username: user.username});
                                    res.setHeader('Set-Cookie', `user=${token.access_token}; secure; path=/; SameSite=Lax;`)
                                    res.writeHead(200,'login successful!', {'content-type': 'text/plain'});
                                    res.end('login successful!')
                                }
                                catch(error){
                                    console.error('error generating token in login', error)
                                }
                            }
                            else{
                                res.writeHead(333, 'wrong password!')
                                res.end('wrong password!')
                            }
                        }
                        else{
                            res.writeHead(405, 'user not found!');
                            res.end('user not found!');
                        }
                    }
                    catch(error){
                        console.log('error finding user by findbyusername', error);
                    }                    
                })
            }
            catch(err){
                console.log('error reading form!')
            }
        }
    }
}

