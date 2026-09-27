import { FileText, Eye, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatFileSize,
  getFileNameFromUrl,
} from "../../../services/moduleUploadService";
import type { AttachedPdfItem } from "./moduleTypes";

interface ModulePdfListProps {
  files?: AttachedPdfItem[];
  existingUrls?: string[];
  title?: string;
  onPreview: (file: { url: string; name: string }) => void;
  onRemoveFile?: (id: string) => void;
  onRemoveUrl?: (url: string) => void;
  onClearAll?: () => void;
}

export default function ModulePdfList({
  files,
  existingUrls,
  title,
  onPreview,
  onRemoveFile,
  onRemoveUrl,
  onClearAll,
}: ModulePdfListProps) {
  if (existingUrls && existingUrls.length > 0) {
    return (
      <div className="space-y-2 min-w-0">
        <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <span>{title || `Current Materials (${existingUrls.length})`}</span>
        </label>

        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 min-w-0">
          {existingUrls.map((url, idx) => {
            const docName = getFileNameFromUrl(url, `Material ${idx + 1}.pdf`);
            return (
              <div
                key={url}
                className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-xl gap-2 hover:border-primary/30 transition-all min-w-0"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                    <FileText size={15} className="stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs font-bold text-foreground truncate"
                      title={docName}
                    >
                      {docName}
                    </p>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View original <ExternalLink size={9} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onPreview({ url, name: docName })}
                    className="h-7 px-2.5 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold gap-1 cursor-pointer shrink-0"
                    title="Preview PDF Document"
                  >
                    <Eye size={12} />
                    <span>Preview</span>
                  </Button>

                  {onRemoveUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveUrl(url)}
                      className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                      title="Remove material"
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (files && files.length > 0) {
    return (
      <div className="space-y-2 pt-1 min-w-0">
        <div className="flex items-center justify-between text-xs font-bold text-foreground px-1">
          <span>{title || `Selected Documents (${files.length})`}</span>
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-[10px] font-semibold text-destructive hover:underline cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 min-w-0">
          {files.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 bg-muted/40 border border-border rounded-xl gap-2 hover:border-primary/30 transition-all min-w-0"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="size-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <FileText size={15} className="stroke-[2.5]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className="text-xs font-bold text-foreground truncate"
                    title={item.name}
                  >
                    {item.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <span>{formatFileSize(item.size)}</span>
                    <span className="inline-block size-1 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Ready
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPreview({ url: item.previewUrl, name: item.name });
                  }}
                  className="h-7 px-2.5 rounded-lg border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-xs font-bold gap-1 cursor-pointer shrink-0"
                  title="Preview PDF Document"
                >
                  <Eye size={12} />
                  <span>Preview</span>
                </Button>

                {onRemoveFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(item.id);
                    }}
                    className="size-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer shrink-0"
                    title="Remove file"
                  >
                    <Trash2 size={13} />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
