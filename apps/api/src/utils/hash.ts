import argon2 from "argon2";

export const hashedPassword = async (password: string) => {
  return await argon2.hash(password);
};

export const verifyPassword = async (hash: string, plain: string) => {
  return await argon2.verify(hash, plain);
};
