import { Router } from "express";
import { Request, Response } from "express";
import * as authService from "../services/auth.services";
import { generateToken } from "../utils/generateToken";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const login = asyncHandler(async (req, res) => {
  const user = await authService.login(req.body);
  var token = "";

  if(user){
    token = generateToken(user.id);
  }

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  });
  return new ApiResponse(200, { user }, "User login successfully" + `token: ${token}` ).send(res);
});

export const signup = asyncHandler(async (req, res) => {
  const newUser = await authService.signupAdmin(req.body);
  return new ApiResponse(201, { user: newUser }, "Admin user created successfully").send(res);
});

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({ message: "User logged out successfully" });
};