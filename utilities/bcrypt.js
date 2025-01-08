import bcrypt from 'bcrypt'

export async function hashIt(password) {
    const saltRounds = 10;
    const hashedPwd = await bcrypt.hash(password, saltRounds);
    return hashedPwd;
}

export async function compareThem(newPass, oldHash) {
    return await bcrypt.compare(newPass, oldHash);
}