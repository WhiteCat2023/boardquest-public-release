import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { uploadImage } from "../../services/cloud.service";
import { ApiResponse } from "../../utils/apiResponse";
import { ApiError } from "../../utils/apiError";

export const uploadBadgeImage = asyncHandler(async (req: Request, res: Response) => {
  const { image, fileName, folder = "badge_icon_image" } = req.body;

  if (!image) {
    throw new ApiError(400, "Image payload is required (base64 string or image URI)");
  }

  // Generate clean public_id from fileName or timestamp
  const sanitizedFileName = fileName
    ? `badge_${String(fileName).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase()}_${Date.now()}`
    : `badge_${Date.now()}`;

  const result = await uploadImage(image, sanitizedFileName, folder);

    return new ApiResponse(
    200,
    {
      imageUrl: result.secure_url || result.url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
    },
    "Badge image uploaded to Supabase Cloud Storage successfully"
  ).send(res);
});

export const uploadModuleFile = asyncHandler(async (req: Request, res: Response) => {
  const { file, image, fileName, folder = "learning_modules" } = req.body;
  const payload = file || image;

  if (!payload) {
    throw new ApiError(400, "File payload is required (base64 data URL string)");
  }

  // Generate clean public_id from fileName or timestamp
  const cleanBase = fileName
    ? String(fileName).replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase()
    : "module";
  const sanitizedFileName = `doc_${cleanBase}_${Date.now()}`;

  const result = await uploadImage(payload, sanitizedFileName, folder);

  return new ApiResponse(
    200,
    {
      fileUrl: result.secure_url || result.url,
      imageUrl: result.secure_url || result.url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
      originalName: fileName || "module.pdf",
    },
    "Module material uploaded to Cloud Storage successfully"
  ).send(res);
});

