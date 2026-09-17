import { Request, Response } from "express";
import { gameRankService } from "../../../services/admin/rank.service";
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiResponse } from "../../../utils/apiResponse";

export const getAllRanks = asyncHandler(
  async (req: Request, res: Response) => {
    const activeOnly =
      req.query.activeOnly === "true" || req.query.isActive === "true";
    const search = req.query.search ? String(req.query.search) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;

    const ranks = await gameRankService.getAllRanks({
      activeOnly,
      search,
      status,
    });
    res
      .status(200)
      .json(new ApiResponse(200, ranks, "Rank tiers retrieved successfully"));
  }
);

export const getRankById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const rank = await gameRankService.getRankById(id);
    res
      .status(200)
      .json(new ApiResponse(200, rank, "Rank tier retrieved successfully"));
  }
);

export const createRank = asyncHandler(
  async (req: Request, res: Response) => {
    const rank = await gameRankService.createRank(req.body);
    res
      .status(201)
      .json(new ApiResponse(201, rank, "Rank tier created successfully"));
  }
);

export const updateRank = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const rank = await gameRankService.updateRank(id, req.body);
    res
      .status(200)
      .json(new ApiResponse(200, rank, "Rank tier updated successfully"));
  }
);

export const toggleRankActive = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const rank = await gameRankService.toggleRankActive(id);
    res
      .status(200)
      .json(new ApiResponse(200, rank, "Rank tier active status toggled"));
  }
);

export const deleteRank = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await gameRankService.deleteRank(id);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Rank tier deleted successfully"));
  }
);

export const getRankStudents = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const search = req.query.search ? String(req.query.search) : undefined;
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const result = await gameRankService.getStudentsInRank(id, {
      search,
      page,
      limit,
    });
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Rank tier enrolled students retrieved successfully"
        )
      );
  }
);
