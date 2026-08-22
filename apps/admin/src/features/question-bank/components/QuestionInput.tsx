import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, Loader2, UploadCloud } from "lucide-react";
import { uploadQuestionImage, fileToBase64 } from "../services/questionImageUploadService";
import { toast } from "sonner";

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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be less than 5MB");
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
      toast.success("Question prompt image uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
          Question Wording / Prompt
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
              >
                {isUploading ? (
                  <Loader2 size={12} className="animate-spin text-primary" />
                ) : (
                  <ImageIcon size={12} className="text-primary" />
                )}
                <span>Add Prompt Image</span>
              </Button>
            ) : null}
          </div>
        )}
      </div>

      {/* Main Textarea */}
      <Textarea
        rows={2}
        placeholder="Formulate the complete problem statement or testing prompt."
        value={questionWording}
        onChange={(e) => setQuestionWording(e.target.value)}
        className="w-full p-2.5 px-3 text-xs bg-muted/40 border border-border rounded-lg focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all duration-150 resize-y leading-normal min-h-[64px]"
      />

      {/* Attached Image Preview */}
      {imageUrl && (
        <div className="relative mt-1 p-2.5 rounded-xl border border-border/80 bg-muted/30 flex items-center gap-3 animate-in fade-in duration-200">
          <div className="relative h-20 w-28 rounded-lg overflow-hidden border border-border bg-black/20 shrink-0 flex items-center justify-center">
            <img
              src={imageUrl}
              alt="Question Prompt Attachment"
              className="h-full w-full object-contain"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center">
                <Loader2 size={16} className="animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-center min-w-0">
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 truncate">
              <UploadCloud size={13} className="text-primary shrink-0" />
              Prompt Image Attached
            </span>
            <span className="text-[10px] text-muted-foreground truncate">
              This image will be displayed above the question prompt.
            </span>

            <div className="flex items-center gap-2 mt-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-5 px-2 text-[9.5px] font-bold rounded-md cursor-pointer border-border hover:bg-muted"
              >
                Change Image
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
    </div>
  );
}

export default QuestionInput;
