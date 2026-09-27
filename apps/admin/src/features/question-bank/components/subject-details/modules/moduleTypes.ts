export interface AttachedPdfItem {
  id: string;
  name: string;
  size: number;
  file?: File;
  url?: string;
  previewUrl: string;
}
