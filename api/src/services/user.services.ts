import { verifyJWT } from "../utils/jwt.utils";

export class UserService {
  decodedId(token: string) {
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
  }
}

export const userService = new UserService();

export const decodedId = userService.decodedId.bind(userService);
