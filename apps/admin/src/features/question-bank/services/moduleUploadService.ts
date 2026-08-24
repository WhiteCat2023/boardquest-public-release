import { AxiosInstance } from "@/utils/AxiosInstance";

export interface UploadedModuleFileResult {
  fileUrl: string;
  originalName: string;
  bytes: number;
  publicId?: string;
  format?: string;
}

/**
 * Converts a browser File object to a Base64 Data URL string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Formats bytes to human-readable size (e.g., 2.4 MB)
 */
export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Extracts a clean document name from a URL or file path
 */
export function getFileNameFromUrl(url: string, fallback = "Document.pdf"): string {
  if (!url) return fallback;
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last) {
      // Strip random timestamp / hashes if formatted as doc_name_12345.pdf
      const decoded = decodeURIComponent(last);
      return decoded.replace(/^doc_/, "").replace(/_\d{10,}\.pdf$/i, ".pdf");
    }
  } catch {
    const segments = url.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    if (last) return last;
  }
  return fallback;
}

/**
 * Upload a single module PDF to Cloud Storage (Supabase Storage: learning_modules bucket/folder)
 */
export async function uploadModulePdf(
  file: File
): Promise<UploadedModuleFileResult> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error(`File "${file.name}" is not a PDF. Please upload PDF files only.`);
  }

  const base64Data = await fileToBase64(file);

  const response = await AxiosInstance.post<{
    statusCode: number;
    data: {
      fileUrl: string;
      imageUrl?: string;
      originalName?: string;
      bytes?: number;
      publicId?: string;
      format?: string;
    };
    message: string;
  }>("/upload/module-file", {
    file: base64Data,
    fileName: file.name,
    folder: "learning_modules",
  });

  const resData = response.data?.data;
  const fileUrl = resData?.fileUrl || resData?.imageUrl;

  if (!fileUrl) {
    throw new Error("Failed to retrieve uploaded file URL");
  }

  return {
    fileUrl,
    originalName: resData?.originalName || file.name,
    bytes: resData?.bytes || file.size,
    publicId: resData?.publicId,
    format: resData?.format || "pdf",
  };
}

/**
 * Upload multiple module PDFs in parallel with progress callback
 */
export async function uploadMultipleModulePdfs(
  files: File[],
  onProgress?: (completed: number, total: number) => void
): Promise<UploadedModuleFileResult[]> {
  let completed = 0;
  const results: UploadedModuleFileResult[] = [];

  const promises = files.map(async (file) => {
    const result = await uploadModulePdf(file);
    completed += 1;
    if (onProgress) {
      onProgress(completed, files.length);
    }
    return result;
  });

  const settled = await Promise.all(promises);
  results.push(...settled);
  return results;
}
