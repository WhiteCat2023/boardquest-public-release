import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface CommentInputFormProps {
  onSubmit: (content: string) => Promise<void>;
  isPending?: boolean;
}

export default function CommentInputForm({
  onSubmit,
  isPending = false,
}: CommentInputFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (err) {
      // Handled upstream
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your comment or feedback here..."
        rows={2}
        className="w-full rounded-xl border border-input bg-background p-2.5 px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y min-h-[64px]"
      />
      <div className="flex items-center justify-end">
        <Button
          type="submit"
          disabled={!content.trim() || isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 py-1.5 rounded-lg h-8 text-xs flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isPending ? (
            <Spinner size="sm" variant="current" />
          ) : (
            <>
              <Send size={13} />
              Post Comment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
