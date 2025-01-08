import { userInfo } from "os";
import { constants } from "../secrets.js";
import jwt from 'jsonwebtoken'


export async function generateAR(user){
    try{
        const access_token = jwt.sign(user, constants.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        return  {access_token};
    }
    catch(err){
        throw err;
    }
}

export async function generateA(token){
    let result = null;
    if(verifyR(token)){
        result = jwt.sign(userInfo, constants.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
    }
    return result;
}

export async function verifyA(token){
    return  jwt.verify(token, constants.ACCESS_TOKEN_SECRET)
}

export  function verifyR(token){
    let result = null;
    return jwt.verify(token, constants.REFRESH_TOKEN_SECRET)
}