import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  ImagePlus,
  X,
  Loader2,
  Maximize2,
  ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { uploadQuestionImage, fileToBase64 } from "../services/questionImageUploadService";
import { toast } from "sonner";

interface MultipleChoiceInputProps {
  mcqChoices: string[];
  mcqChoiceImages?: string[];
  mcqCorrectIndex: number;
  handleChange: (index: number, value: string) => void;
  handleImageChange?: (index: number, imageUrl: string) => void;
  setMcqCorrectIndex: (value: number) => void;
  handleAddChoice: () => void;
  handleRemoveChoice?: (index: number) => void;
}

export default function MultipleChoiceInput({
  mcqChoices,
  mcqChoiceImages = [],
  mcqCorrectIndex,
  handleChange,
  handleImageChange,
  setMcqCorrectIndex,
  handleAddChoice,
  handleRemoveChoice,
}: MultipleChoiceInputProps) {
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [zoomImage, setZoomImage] = useState<{ url: string; label: string } | null>(null);

  const processChoiceFile = async (index: number, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WebP, GIF)");
      return;
    }

    const maxFileSizeMb = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 5;
    if (file.size > maxFileSizeMb * 1024 * 1024) {
      toast.error(`Image file size must be less than ${maxFileSizeMb}MB`);
      return;
    }

    try {
      setUploadingIndex(index);
      const base64 = await fileToBase64(file);
      if (handleImageChange) {
        handleImageChange(index, base64);
      }

      const uploadedUrl = await uploadQuestionImage(
        file,
        `choice_${String.fromCharCode(65 + index)}_${file.name}`,
      );
      if (handleImageChange) {
        handleImageChange(index, uploadedUrl);
      }
      toast.success(`Option ${String.fromCharCode(65 + index)} image uploaded!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload choice image.");
    } finally {
      setUploadingIndex(null);
      if (fileInputRefs.current[index]) {
        fileInputRefs.current[index]!.value = "";
      }
    }
  };

  const handleChoiceFile = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processChoiceFile(index, file);
    }
  };

  const handleRemoveChoiceImage = (index: number) => {
    if (handleImageChange) {
      handleImageChange(index, "");
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <RadioGroup
        value={mcqCorrectIndex.toString()}
        onValueChange={(val) => setMcqCorrectIndex(parseInt(val, 10))}
        className="flex flex-col gap-2.5"
      >
        {mcqChoices.map((choice, index) => {
          const label = String.fromCharCode(65 + index); // A, B, C, D...
          const choiceImage = mcqChoiceImages[index] || "";
          const isUploadingThis = uploadingIndex === index;
          const isSelected = mcqCorrectIndex === index;

          return (
            <div
              key={index}
              className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                isSelected
                  ? "bg-primary/5 border-primary/40 shadow-2xs"
                  : "bg-card border-border hover:border-border/80"
              }`}
            >
              {/* Radio Indicator */}
              <div className="flex items-center justify-center pl-1">
                <RadioGroupItem
                  value={index.toString()}
                  id={`mcq-option-${index}`}
                  className="w-4 h-4 border-2 border-border hover:border-primary bg-card data-[state=checked]:border-primary data-[state=checked]:bg-card cursor-pointer shrink-0 focus-visible:ring-ring/20 flex items-center justify-center"
                />
              </div>

              {/* Option Badge */}
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {label}
              </span>

              {/* Option Wording Input */}
              <Input
                type="text"
                placeholder={
                  choiceImage
                    ? `Option ${label} caption (optional - image attached)`
                    : `Wording for Option ${label}`
                }
                value={choice}
                onChange={(e) => handleChange(index, e.target.value)}
                className="bg-muted/30 border-border/80 rounded-lg focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground text-xs h-8 flex-1 placeholder:text-muted-foreground"
              />

              {/* Choice Image Attachment / Thumbnail */}
              {handleImageChange && (
                <div className="shrink-0 flex items-center gap-1">
                  <input
                    ref={(el) => {
                      fileInputRefs.current[index] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleChoiceFile(index, e)}
                  />

                  {choiceImage ? (
                    <div className="relative group flex items-center">
                      <div
                        onClick={() => setZoomImage({ url: choiceImage, label: `Option ${label}` })}
                        className="h-8 w-12 rounded-lg border border-primary/40 bg-black/20 overflow-hidden cursor-pointer hover:opacity-85 transition-all flex items-center justify-center relative group"
                        title={`Click to view Option ${label} image`}
                      >
                        <img
                          src={choiceImage}
                          alt={`Option ${label}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 size={11} />
                        </div>
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center">
                            <Loader2 size={12} className="animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChoiceImage(index)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-destructive text-white rounded-full flex items-center justify-center shadow-xs hover:bg-destructive/90 transition-colors cursor-pointer"
                        title="Remove choice image"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={isUploadingThis}
                      className="h-8 px-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1 border border-dashed border-border hover:border-primary/40"
                      title={`Attach image to Option ${label}`}
                    >
                      {isUploadingThis ? (
                        <Loader2 size={13} className="animate-spin text-primary" />
                      ) : (
                        <ImagePlus size={14} className="text-primary" />
                      )}
                      <span className="text-[10px] hidden sm:inline">Add Image</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Remove Choice Button (if more than 2 options) */}
              {mcqChoices.length > 2 && handleRemoveChoice && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveChoice(index)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer shrink-0"
                  title="Remove option"
                >
                  <Trash2 size={13} />
                </Button>
              )}
            </div>
          );
        })}
      </RadioGroup>

      {/* Add Another Choice Button */}
      <div className="pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddChoice}
          className="w-full sm:w-auto h-8 border-dashed border-border bg-transparent hover:bg-accent text-foreground font-semibold px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer text-xs"
        >
          <Plus size={13} className="text-primary" />
          <span>Add Another Choice</span>
        </Button>
      </div>

      {/* Choice Image Zoom Dialog */}
      <Dialog open={zoomImage !== null} onOpenChange={(open) => !open && setZoomImage(null)}>
        <DialogContent className="max-w-xl bg-card border border-border rounded-2xl p-4 text-foreground">
          <DialogHeader className="pb-2 border-b border-border">
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <ImageIcon size={16} className="text-primary" />
              {zoomImage?.label} Choice Image Preview
            </DialogTitle>
          </DialogHeader>
          {zoomImage && (
            <div className="flex items-center justify-center p-2 max-h-[60vh] overflow-hidden bg-black/10 rounded-xl border border-border">
              <img
                src={zoomImage.url}
                alt={zoomImage.label}
                className="max-h-[55vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
