import jwt from "jsonwebtoken";

export const decodedId = (token: string) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string);
    const userId = (decodedToken as { id: string }).id;
    return userId;
  } catch (error) {
    throw new Error("InvalidToken");
  }
};
