import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Image as ImageIcon,
  X,
  Loader2,
  UploadCloud,
  Maximize2,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadQuestionImage, fileToBase64 } from "../services/questionImageUploadService";
import { showFeedback } from "@/components/modal";

interface QuestionInputProps {
  questionWording: string;
  setQuestionWording: (value: string) => void;
  imageUrl?: string;
  setImageUrl?: (value: string) => void;
}

function QuestionInput({
  questionWording,
  setQuestionWording,
  imageUrl = "",
  setImageUrl,
}: QuestionInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const processImageFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      showFeedback.error("Please upload a valid image file (PNG, JPG, WebP, GIF)");
      return;
    }

    const maxFileSizeMb = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 5;
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      showFeedback.error(`Image file size must be less than ${maxFileSizeMb}MB`);
      return;
    }

    try {
      setIsUploading(true);
      // Immediately set temporary base64 for instant preview
      const base64 = await fileToBase64(file);
      if (setImageUrl) {
        setImageUrl(base64);
      }

      // Upload to cloud storage in background
      const uploadedUrl = await uploadQuestionImage(file, file.name);
      if (setImageUrl) {
        setImageUrl(uploadedUrl);
      }
      showFeedback.success("Question prompt image uploaded successfully!");
    } catch (err: any) {
      showFeedback.error(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (setImageUrl) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!setImageUrl) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    if (setImageUrl) {
      setImageUrl("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header bar with Image Attachment Button */}
      <div className="flex items-center justify-between">
        <Label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
          Question
        </Label>

        {setImageUrl && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {!imageUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-6 px-2 text-[10.5px] font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md flex items-center gap-1 cursor-pointer transition-all"
                title="Attach an image diagram, chart, or formula to this question"
              >
                {isUploading ? (
                  <Loader2 size={12} className="animate-spin text-primary" />
                ) : (
                  <ImageIcon size={12} className="text-primary" />
                )}
                <span>Add Question Image</span>
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Textarea with Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-lg transition-all ${
          isDragOver ? "ring-2 ring-primary ring-offset-1 bg-primary/5" : ""
        }`}
      >
        <Textarea
          rows={2}
          placeholder="Formulate the complete problem statement or testing prompt."
          value={questionWording}
          onChange={(e) => setQuestionWording(e.target.value)}
          className="w-full p-2.5 px-3 text-xs bg-muted/40 border border-border rounded-lg focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-150 resize-y leading-normal min-h-[64px]"
        />

        {isDragOver && (
          <div className="absolute inset-0 bg-primary/10 backdrop-blur-xs rounded-lg border-2 border-dashed border-primary flex items-center justify-center pointer-events-none">
            <span className="text-xs font-bold text-primary flex items-center gap-1.5">
              <UploadCloud size={16} />
              Drop image to attach to question
            </span>
          </div>
        )}
      </div>

      {/* Attached Image Preview Card */}
      {imageUrl && (
        <div className="relative mt-1 p-2.5 rounded-xl border border-border/80 bg-muted/30 flex items-center gap-3 animate-in fade-in duration-200">
          <div
            onClick={() => setIsZoomOpen(true)}
            className="relative h-20 w-28 rounded-lg overflow-hidden border border-border bg-black/20 shrink-0 flex items-center justify-center cursor-pointer group hover:border-primary transition-all"
            title="Click to view full image"
          >
            <img
              src={imageUrl}
              alt="Question Prompt Attachment"
              className="h-full w-full object-contain"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Maximize2 size={16} />
            </div>
            {isUploading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 truncate">
              <UploadCloud size={13} className="text-primary shrink-0" />
              Question Image Attached
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              This image will be displayed directly alongside the question prompt.
            </span>

            <div className="flex items-center gap-2 mt-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsZoomOpen(true)}
                className="h-5 px-2 text-[9.5px] font-bold rounded-md cursor-pointer border-border hover:bg-muted flex items-center gap-1"
              >
                <Maximize2 size={10} />
                Zoom
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-5 px-2 text-[9.5px] font-bold rounded-md cursor-pointer border-border hover:bg-muted"
              >
                Change
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveImage}
                className="h-5 px-2 text-[9.5px] font-bold text-destructive hover:bg-destructive/10 rounded-md cursor-pointer flex items-center gap-1"
              >
                <X size={11} />
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Lightbox Dialog */}
      <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border rounded-2xl p-4 text-foreground">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon size={16} className="text-primary" />
              Question Image Preview
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-2 max-h-[70vh] overflow-hidden bg-black/10 rounded-xl border border-border">
            <img
              src={imageUrl}
              alt="Question Large Preview"
              className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default QuestionInput;
