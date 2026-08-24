import jwt from "jsonwebtoken";
export function signJWT(payload, expiresIn) {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
        throw new Error("PRIVATE_KEY is not defined in environment variables");
    }
    return jwt.sign(payload, privateKey, { expiresIn });
}
export function verifyJWT(token) {
    const privateKey = process.env.PRIVATE_KEY;
    try {
        const decoded = jwt.verify(token, privateKey);
        return { payload: decoded, expired: false };
    }
    catch (error) {
        return { payload: null, expired: true, error: error.message.includes("jwt expired") };
    }
}
export function extractUserIdFromToken(token) {
    const { payload, expired } = verifyJWT(token);
    if (expired || !payload) {
        throw new Error("InvalidToken");
    }
    return payload.id;
}
// Alias for backward compatibility
export const decodedId = extractUserIdFromToken;
