import React, { useState, useMemo } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  CheckCircle2,
  Loader2,
  BookOpen,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  useTopics,
  useCreateTopic,
  useUpdateTopic,
  useDeleteTopic,
  type Topic,
} from "@/features/question-bank/api/useTopics";
import { showFeedback } from "@/components/modal";

interface TopicCMSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  categoryName?: string;
  selectedTopic?: string;
  onSelectTopic: (topicName: string) => void;
  initialMode?: "create" | "manage";
}

export function TopicCMSModal({
  open,
  onOpenChange,
  categoryId,
  categoryName = "Selected Subject",
  selectedTopic,
  onSelectTopic,
  initialMode = "manage",
}: TopicCMSModalProps) {
  const { data: topics = [], isLoading } = useTopics(categoryId);
  const createTopicMutation = useCreateTopic(categoryId);
  const updateTopicMutation = useUpdateTopic(categoryId);
  const deleteTopicMutation = useDeleteTopic(categoryId);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Create form state
  const [newTopicName, setNewTopicName] = useState("");
  const createInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && initialMode === "create") {
      const timer = setTimeout(() => {
        createInputRef.current?.focus();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [open, initialMode]);

  // Inline edit state
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTopicName, setEditingTopicName] = useState("");

  // Inline delete confirmation state
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return topics;
    const q = searchQuery.toLowerCase().trim();
    return topics.filter((t) => t.name.toLowerCase().includes(q));
  }, [topics, searchQuery]);

  // Handle Add Topic
  const handleAddTopic = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTopicName.trim();
    if (!clean) return;

    // Check client-side duplicate
    if (topics.some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      showFeedback.error(`Topic "${clean}" already exists for this subject.`);
      return;
    }

    try {
      const created = await createTopicMutation.mutateAsync({ name: clean });
      setNewTopicName("");
      // Automatically select the newly created topic
      if (created?.name) {
        onSelectTopic(created.name);
      } else {
        onSelectTopic(clean);
      }
    } catch {
      // Error handled in hook
    }
  };

  // Start Inline Edit
  const handleStartEdit = (topic: Topic) => {
    setEditingTopicId(topic.id);
    setEditingTopicName(topic.name);
    setDeletingTopicId(null);
  };

  // Save Inline Edit
  const handleSaveEdit = async (topicId: string, oldName: string) => {
    const clean = editingTopicName.trim();
    if (!clean) {
      showFeedback.error("Topic name cannot be empty.");
      return;
    }
    if (clean.toLowerCase() === oldName.toLowerCase()) {
      setEditingTopicId(null);
      return;
    }

    try {
      await updateTopicMutation.mutateAsync({ id: topicId, name: clean });
      setEditingTopicId(null);
      // If currently selected, update selection
      if (selectedTopic === oldName) {
        onSelectTopic(clean);
      }
    } catch {
      // Error handled in hook
    }
  };

  // Handle Delete Topic
  const handleConfirmDelete = async (topic: Topic) => {
    try {
      await deleteTopicMutation.mutateAsync(topic.id);
      setDeletingTopicId(null);
      if (selectedTopic === topic.name) {
        onSelectTopic("");
      }
    } catch {
      // Error handled in hook
    }
  };

  const handleSelectAndClose = (name: string) => {
    onSelectTopic(name);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl w-[95vw] p-0 overflow-hidden bg-card border border-border shadow-2xl rounded-2xl">
        {/* Modal Header */}
        <div className="p-5 pb-4 border-b border-border/80 bg-muted/20">
          <DialogHeader className="gap-1.5 text-left">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <Layers className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <span>Topic Management (CMS)</span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold text-primary border-primary/20 bg-primary/5 py-0 px-1.5"
                  >
                    {categoryName}
                  </Badge>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Organize, add, and rename evaluation topics for this subject curriculum.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Create New Topic Section */}
          <form onSubmit={handleAddTopic} className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                ref={createInputRef}
                type="text"
                placeholder="Enter new topic name (e.g. Clinical Enzymology)..."
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                disabled={createTopicMutation.isPending}
                className="h-9 text-xs bg-card border-border pr-3 focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary placeholder:text-muted-foreground/70"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!newTopicName.trim() || createTopicMutation.isPending}
              className="h-9 px-3.5 text-xs font-semibold shrink-0 gap-1.5 shadow-2xs"
            >
              {createTopicMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>Add Topic</span>
            </Button>
          </form>
        </div>

        {/* Search & Topic Count Bar */}
        <div className="px-5 py-2.5 border-b border-border/60 bg-muted/10 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7.5 pl-8 text-[11px] bg-background/50 border-border rounded-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
            {filteredTopics.length} {filteredTopics.length === 1 ? "topic" : "topics"}
          </span>
        </div>

        {/* Topics List Body */}
        <div className="p-5 max-h-[360px] overflow-y-auto flex flex-col gap-2">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              <p className="text-xs font-medium">Loading topics...</p>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2 border border-dashed border-border/80 rounded-xl bg-muted/10">
              <div className="size-9 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60">
                <BookOpen className="size-4" />
              </div>
              <p className="text-xs font-semibold text-foreground">
                {searchQuery ? "No matching topics found" : "No topics created yet"}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs">
                {searchQuery
                  ? "Try searching for a different keyword or create this topic using the form above."
                  : "Add your first topic above to start categorizing questions for this subject."}
              </p>
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isSelected = selectedTopic === topic.name;
              const isEditing = editingTopicId === topic.id;
              const isDeleting = deletingTopicId === topic.id;

              return (
                <div
                  key={topic.id}
                  className={`p-2.5 px-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-primary/40 bg-primary/5 shadow-2xs"
                      : "border-border/70 bg-card hover:bg-muted/30"
                  }`}
                >
                  {/* Topic Details / Inline Edit Input */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <Input
                          type="text"
                          value={editingTopicName}
                          onChange={(e) => setEditingTopicName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveEdit(topic.id, topic.name);
                            } else if (e.key === "Escape") {
                              setEditingTopicId(null);
                            }
                          }}
                          autoFocus
                          className="h-7 text-xs bg-background py-1"
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleSaveEdit(topic.id, topic.name)}
                          disabled={updateTopicMutation.isPending}
                          className="size-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                          title="Save topic name"
                        >
                          <Check className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingTopicId(null)}
                          className="size-7 text-muted-foreground hover:bg-muted"
                          title="Cancel"
                        >
                          <X className="size-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate">
                          {topic.name}
                        </span>
                        {isSelected && (
                          <Badge
                            variant="secondary"
                            className="text-[9.5px] font-bold text-primary bg-primary/10 border-none px-1.5 py-0 shrink-0"
                          >
                            Selected
                          </Badge>
                        )}
                        {(topic.questionCount ?? 0) > 0 ? (
                          <span className="text-[10px] text-muted-foreground font-medium shrink-0 bg-muted/60 px-1.5 py-0.5 rounded-md border border-border/40">
                            {topic.questionCount}{" "}
                            {topic.questionCount === 1 ? "question" : "questions"}
                          </span>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      {isDeleting ? (
                        <div className="flex items-center gap-1 bg-destructive/10 border border-destructive/20 p-1 rounded-lg">
                          <span className="text-[10px] font-bold text-destructive px-1">
                            Delete?
                          </span>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => handleConfirmDelete(topic)}
                            disabled={deleteTopicMutation.isPending}
                            className="size-6 h-6 w-6 text-xs"
                            title="Confirm delete"
                          >
                            <Check className="size-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingTopicId(null)}
                            className="size-6 h-6 w-6 text-xs text-muted-foreground"
                            title="Cancel"
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            variant={isSelected ? "secondary" : "outline"}
                            onClick={() => handleSelectAndClose(topic.name)}
                            className="h-7 px-2.5 text-[11px] font-semibold gap-1 rounded-lg"
                          >
                            {isSelected ? (
                              <>
                                <CheckCircle2 className="size-3 text-primary" />
                                <span>Active</span>
                              </>
                            ) : (
                              <span>Use</span>
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleStartEdit(topic)}
                            className="size-7 text-muted-foreground hover:text-foreground rounded-lg"
                            title="Rename topic"
                          >
                            <Pencil className="size-3" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeletingTopicId(topic.id)}
                            className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            title="Delete topic"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 px-5 border-t border-border/80 bg-muted/20 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Changes to topics apply immediately across Question Bank filters.
          </p>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 px-4 text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TopicCMSModal;
