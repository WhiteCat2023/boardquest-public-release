import { AxiosInstance } from "@/utils/AxiosInstance";

export interface UploadBadgeImageResponse {
  imageUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload a badge image to Supabase Cloud Storage in the "badge_icon_image" bucket/folder
 * Accepts base64 data URL string or file object
 */
export async function uploadBadgeImage(
  imageSource: string | File,
  fileName?: string
): Promise<string> {
  let base64String: string;

  if (typeof imageSource === "string") {
    base64String = imageSource;
  } else if (imageSource instanceof File) {
    base64String = await fileToBase64(imageSource);
  } else {
    throw new Error("Invalid image source");
  }

  const response = await AxiosInstance.post<{
    statusCode: number;
    data: UploadBadgeImageResponse;
    message: string;
  }>("/upload/badge-image", {
    image: base64String,
    fileName: fileName || "badge",
    folder: "badge_icon_image",
  });

  const data = response.data?.data;
  if (!data?.imageUrl) {
    throw new Error("Failed to retrieve image URL from storage response");
  }

  return data.imageUrl;
}

// Backward-compatible alias
export const uploadBadgeImageToCloudinary = uploadBadgeImage;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
