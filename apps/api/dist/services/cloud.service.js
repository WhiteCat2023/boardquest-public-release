import { cloudinaryClient } from "../config/cloudinary";
export const uploadImage = async (fileSource, fileName, folder = "badge_icon_image") => {
    try {
        if (typeof fileSource === "string") {
            const result = await cloudinaryClient.uploader.upload(fileSource, {
                folder: folder || "badge_icon_image",
                public_id: fileName,
                resource_type: "auto",
                overwrite: true,
            });
            return result;
        }
        const uploadPromise = new Promise((resolve, reject) => {
            const uploadStream = cloudinaryClient.uploader.upload_stream({
                folder: folder || "badge_icon_image",
                public_id: fileName,
                resource_type: "auto",
                overwrite: true,
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(fileSource);
        });
        return await uploadPromise;
    }
    catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};
