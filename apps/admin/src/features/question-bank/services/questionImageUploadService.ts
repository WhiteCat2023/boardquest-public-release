import { AxiosInstance } from "@/utils/AxiosInstance";

export async function uploadQuestionImage(
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
    data: { imageUrl: string };
    message: string;
  }>("/upload/badge-image", {
    image: base64String,
    fileName: fileName || "question",
    folder: "question_images",
  });

  const data = response.data?.data;
  if (!data?.imageUrl) {
    throw new Error("Failed to upload question image");
  }

  return data.imageUrl;
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
