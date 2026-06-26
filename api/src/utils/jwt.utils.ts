import jwt, {SignOptions} from "jsonwebtoken";





export function signJWT(payload: object, expiresIn: string | number) {
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not defined in environment variables");
    }

    return jwt.sign(payload, privateKey!, { expiresIn } as SignOptions);
}

export function verifyJWT(token: string) {
    const privateKey = process.env.PRIVATE_KEY;
    try{
        const decoded = jwt.verify(token, privateKey!);
        return {payload: decoded, expired: false};
    } catch (error: any) {
        return {payload: null, expired: true, error: error.message.includes("jwt expired")};
    }
}


  