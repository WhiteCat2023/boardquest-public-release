import argon2 from "argon2";
import bcrypt from "bcryptjs";

export const hashedPassword = async (password: string) => {
  return await argon2.hash(password);
};

export const hashBcrypt = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (hash: string, plain: string) => {
  return await argon2.verify(hash, plain);
};

export const verifyBcrypt = async (hash: string, plain: string) => {
  return await bcrypt.compare(hash, plain);
};
