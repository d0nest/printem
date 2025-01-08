import { User } from '../build/entity/User.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile } from 'fs';
import formidable from 'formidable';
import { dataSource } from '../index.js';
import { compareThem, hashIt } from '../utilities/bcrypt.js';
import * as jwt from '../utilities/jwt.js'
import { getFileContent } from '../utilities/files.js';

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
            const sliced = cookie.slice(cookie.indexOf('=') + 1)
            const letEmGo = await jwt.verifyA(sliced);
            const content = await getFileContent('dashboard.html')
            console.log(letEmGo)

            res.setHeader('content-type', 'text/html');
            res.writeHead(200)
            res.end(content)
        }
    },
    'POST': {
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
                                    let created = await User.save(user)
                                    console.log(created)
                                    if (created) {
                                        try {
                                            const tokens = await jwt.generateAR({ userid: created.userid, username: created.username });
                                            res.setHeader('Set-Cookie', `user=${tokens.access_token}; path=/; Secure; SameSite=Lax`)
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
                            if(compareThem(fields.password[0], user.password)){
                                try{
                                    const token = await jwt.generateAR({userid:user.userid, username: user.username});
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

