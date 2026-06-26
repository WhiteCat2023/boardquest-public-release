import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  // const JWT_SECRET = process.env.JWT_SECRET;
  const PRIVATE_KEY = process.env.PRIVATE_KEY
  
  if (!PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not defined in environment variables");
  }
  
  return jwt.sign({ id: userId }, PRIVATE_KEY, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (userId: string) => {
  const PRIVATE_KEY = process.env.PUBLIC_KEY;

  if (!PRIVATE_KEY) {
    throw new Error("PUBLIC_KEY is not defined in environment variables");
  }

  return jwt.sign({ id: userId }, PRIVATE_KEY, {
    expiresIn: "5s",
  });
};
