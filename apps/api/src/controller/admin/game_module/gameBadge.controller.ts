import { Request, Response } from "express";
import { gameBadgeService } from "../../../services/admin/gameBadge.service";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiResponse } from "../../../utils/apiResponse";

export const getAllBadges = asyncHandler(
  async (_req: Request, res: Response) => {
    const badges = await gameBadgeService.getAllBadges();
    res
      .status(200)
      .json(new ApiResponse(200, badges, "Badges retrieved successfully"));
  }
);

export const getBadgeById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const badge = await gameBadgeService.getBadgeById(id);
    res
      .status(200)
      .json(new ApiResponse(200, badge, "Badge retrieved successfully"));
  }
);

export const createBadge = asyncHandler(
  async (req: Request, res: Response) => {
    const badge = await gameBadgeService.createBadge(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, badge, "Badge created successfully"));
  }
);

export const updateBadge = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const badge = await gameBadgeService.updateBadge(id, req.body);
    res
      .status(200)
      .json(new ApiResponse(200, badge, "Badge updated successfully"));
  }
);

export const toggleBadgeActive = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const badge = await gameBadgeService.toggleBadgeActive(id);
    res
      .status(200)
      .json(new ApiResponse(200, badge, "Badge active status toggled"));
  }
);

export const deleteBadge = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const badge = await gameBadgeService.deleteBadge(id);
    res
      .status(200)
      .json(new ApiResponse(200, badge, "Badge deleted successfully"));
  }
);
