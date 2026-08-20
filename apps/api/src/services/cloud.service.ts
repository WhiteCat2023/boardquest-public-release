import { cloudinaryClient } from "../config/cloudinary";

export interface CloudinaryUploadResult {
    secure_url: string;
    url: string;
    public_id: string;
    format: string;
    width: number;
    height: number;
    bytes: number;
    created_at: string;
    [key: string]: any;
}

export const uploadImage = async (
    fileSource: Buffer | string,
    fileName?: string,
    folder: string = "badge_icon_image"
): Promise<CloudinaryUploadResult> => {
    try {
        if (typeof fileSource === "string") {
            const result = await cloudinaryClient.uploader.upload(fileSource, {
                folder: folder || "badge_icon_image",
                public_id: fileName,
                resource_type: "auto",
                overwrite: true,
            });
            return result as CloudinaryUploadResult;
        }

        const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinaryClient.uploader.upload_stream(
                {
                    folder: folder || "badge_icon_image",
                    public_id: fileName,
                    resource_type: "auto",
                    overwrite: true,
                },
                (error: any, result: any) => {
                    if (error) reject(error);
                    else resolve(result as CloudinaryUploadResult);
                }
            );
            uploadStream.end(fileSource);
        });

        return await uploadPromise;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
}; 