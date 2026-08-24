import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ImagePlus, X, Loader2 } from "lucide-react";
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

  const handleChoiceFile = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadingIndex(index);
      const base64 = await fileToBase64(file);
      if (handleImageChange) {
        handleImageChange(index, base64);
      }

      const uploadedUrl = await uploadQuestionImage(file, `choice_${String.fromCharCode(65 + index)}_${file.name}`);
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

  const handleRemoveChoiceImage = (index: number) => {
    if (handleImageChange) {
      handleImageChange(index, "");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <RadioGroup
        value={mcqCorrectIndex.toString()}
        onValueChange={(val) => setMcqCorrectIndex(parseInt(val, 10))}
        className="flex flex-col gap-2"
      >
        {mcqChoices.map((choice, index) => {
          const label = String.fromCharCode(65 + index); // A, B, C, D...
          const choiceImage = mcqChoiceImages[index] || "";
          const isUploadingThis = uploadingIndex === index;

          return (
            <div key={index} className="flex items-center gap-2 w-full">
              {/* Radio Indicator */}
              <RadioGroupItem
                value={index.toString()}
                id={`mcq-option-${index}`}
                className="w-4 h-4 border-2 border-border hover:border-primary bg-card data-[state=checked]:border-primary data-[state=checked]:bg-card cursor-pointer shrink-0 focus-visible:ring-ring/20 flex items-center justify-center"
              />

              {/* Option Wording Input */}
              <Input
                type="text"
                placeholder={`Wording for Option ${label}`}
                value={choice}
                onChange={(e) => handleChange(index, e.target.value)}
                className="bg-card border-border rounded-lg focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground text-xs h-8 flex-1 placeholder:text-muted-foreground"
              />

              {/* Choice Image Attachment / Thumbnail */}
              {handleImageChange && (
                <div className="shrink-0 flex items-center">
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
                        onClick={() => fileInputRefs.current[index]?.click()}
                        className="h-8 w-10 rounded-md border border-primary/40 bg-black/20 overflow-hidden cursor-pointer hover:opacity-80 transition-all flex items-center justify-center"
                        title={`Change Option ${label} image`}
                      >
                        <img
                          src={choiceImage}
                          alt={`Option ${label}`}
                          className="h-full w-full object-cover"
                        />
                        {isUploadingThis && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-xs flex items-center justify-center">
                            <Loader2 size={12} className="animate-spin text-primary" />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveChoiceImage(index)}
                        className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-destructive text-white rounded-full flex items-center justify-center shadow-2xs hover:bg-destructive/80 transition-colors cursor-pointer"
                        title="Remove choice image"
                      >
                        <X size={9} />
                      </button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fileInputRefs.current[index]?.click()}
                      disabled={isUploadingThis}
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer shrink-0"
                      title={`Add image to Option ${label}`}
                    >
                      {isUploadingThis ? (
                        <Loader2 size={13} className="animate-spin text-primary" />
                      ) : (
                        <ImagePlus size={14} />
                      )}
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
    </div>
  );
}
