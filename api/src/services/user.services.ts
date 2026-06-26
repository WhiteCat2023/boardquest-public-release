import { verifyJWT } from "../utils/jwt.utils";

export const decodedId = (token: string) => {
  try {
    const { payload, expired } = verifyJWT(token);
    if (expired || !payload) {
      throw new Error("InvalidToken");
    }
    const userId = (payload as { id: string }).id;
    return userId;
  } catch (error) {
    throw new Error("InvalidToken");
  }
};
