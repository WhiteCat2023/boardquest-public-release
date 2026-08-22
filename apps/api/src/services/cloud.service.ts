import { supabaseClient, DEFAULT_STORAGE_BUCKET } from "../config/supabase";

export interface CloudStorageUploadResult {
  secure_url: string;
  url: string;
  public_id: string;
  path: string;
  bucket: string;
  format: string;
  bytes: number;
  created_at: string;
  [key: string]: any;
}

// Backward-compatible type alias
export type CloudinaryUploadResult = CloudStorageUploadResult;

interface ParsedFile {
  buffer: Buffer;
  mimeType: string;
  extension: string;
}

function parseFileSource(
  fileSource: Buffer | string,
  fallbackName?: string,
): ParsedFile {
  if (Buffer.isBuffer(fileSource)) {
    return {
      buffer: fileSource,
      mimeType: "image/png",
      extension: "png",
    };
  }

  const str = fileSource.trim();

  // Handle data URI (e.g. data:image/png;base64,iVBORw0KGgo...)
  const dataUriMatch = str.match(
    /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/,
  );
  if (dataUriMatch) {
    const mimeType = dataUriMatch[1];
    const base64Data = dataUriMatch[2];
    const buffer = Buffer.from(base64Data, "base64");
    const extension =
      mimeType.split("/")[1]?.replace("svg+xml", "svg") || "png";
    return { buffer, mimeType, extension };
  }

  // Handle raw base64 string
  try {
    const buffer = Buffer.from(str, "base64");
    return {
      buffer,
      mimeType: "image/png",
      extension: "png",
    };
  } catch {
    return {
      buffer: Buffer.from(str),
      mimeType: "text/plain",
      extension: "txt",
    };
  }
}

let bucketEnsured = false;

async function ensureBucketPublic(bucketName: string) {
  if (bucketEnsured) return;
  try {
    const { data: buckets } = await supabaseClient.storage.listBuckets();
    const targetBucket = buckets?.find(
      (b) => b.name === bucketName || b.id === bucketName,
    );
    if (!targetBucket) {
      await supabaseClient.storage.createBucket(bucketName, { public: true });
    } else if (!targetBucket.public) {
      await supabaseClient.storage.updateBucket(bucketName, { public: true });
    }
    bucketEnsured = true;
  } catch (err) {
    console.warn("[Supabase Storage] Bucket ensure warning:", err);
  }
}

/**
 * Upload an image/asset to Supabase Cloud Storage
 *
 * @param fileSource Buffer or Base64 string (including data URI)
 * @param fileName Custom file name identifier (e.g. "badge_sharp_mind_123")
 * @param folder Subfolder within the storage bucket (default: "badge_icon_image")
 * @param bucket Storage bucket name (defaults to SUPABASE_STORAGE_BUCKET env or "boardquest-storage")
 */
export const uploadImage = async (
  fileSource: Buffer | string,
  fileName?: string,
  folder: string = "badge_icon_image",
  bucket: string = DEFAULT_STORAGE_BUCKET,
): Promise<CloudStorageUploadResult> => {
  try {
    await ensureBucketPublic(bucket);

    const { buffer, mimeType, extension } = parseFileSource(
      fileSource,
      fileName,
    );

    const cleanFolder = folder.replace(/^\/+|\/+$/g, "");
    const baseName = fileName
      ? String(fileName)
          .replace(/[^a-zA-Z0-9_-]/g, "_")
          .toLowerCase()
      : `asset_${Date.now()}`;

    // Append extension if not already present
    const finalFileName = baseName.endsWith(`.${extension}`)
      ? baseName
      : `${baseName}.${extension}`;
    const filePath = cleanFolder
      ? `${cleanFolder}/${finalFileName}`
      : finalFileName;

    // Upload to Supabase Storage with upsert enabled
    const { data: uploadData, error: uploadError } =
      await supabaseClient.storage.from(bucket).upload(filePath, buffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error("[Supabase Storage] Upload error:", uploadError);
      throw new Error(`Supabase Storage Upload Failed: ${uploadError.message}`);
    }

    // Retrieve public URL for the uploaded object
    const { data: urlData } = supabaseClient.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = urlData?.publicUrl || "";

    return {
      secure_url: publicUrl,
      url: publicUrl,
      public_id: filePath,
      path: filePath,
      bucket,
      format: extension,
      bytes: buffer.byteLength,
      created_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error("[Cloud Storage Upload Error]:", error);
    throw error;
  }
};
