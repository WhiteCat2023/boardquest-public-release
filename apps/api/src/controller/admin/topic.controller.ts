import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { topicService } from "../../services/admin/topic.service.js";

export const getTopicsBySubject = asyncHandler(async (req: Request, res: Response) => {
  const subjectId = String(req.params.categoryId || req.params.subjectId || "ALL").trim();

  const topics = await topicService.getTopicsBySubject(subjectId);
  return new ApiResponse(200, { topics }, "Topics retrieved successfully").send(res);
});

export const createTopic = asyncHandler(async (req: Request, res: Response) => {
  const subjectId = String(req.params.categoryId || req.params.subjectId || "").trim();
  if (!subjectId) {
    return new ApiResponse(400, null, "Subject ID is required").send(res);
  }

  const { name, description } = req.body;
  const topic = await topicService.createTopic(subjectId, { name, description });
  return new ApiResponse(201, { topic }, "Topic created successfully").send(res);
});

export const updateTopic = asyncHandler(async (req: Request, res: Response) => {
  const topicId = String(req.params.topicId || "").trim();
  if (!topicId) {
    return new ApiResponse(400, null, "Topic ID is required").send(res);
  }

  const { name, description } = req.body;
  const topic = await topicService.updateTopic(topicId, { name, description });
  return new ApiResponse(200, { topic }, "Topic updated successfully").send(res);
});

export const deleteTopic = asyncHandler(async (req: Request, res: Response) => {
  const topicId = String(req.params.topicId || "").trim();
  if (!topicId) {
    return new ApiResponse(400, null, "Topic ID is required").send(res);
  }

  await topicService.deleteTopic(topicId);
  return new ApiResponse(200, null, "Topic deleted successfully").send(res);
});
