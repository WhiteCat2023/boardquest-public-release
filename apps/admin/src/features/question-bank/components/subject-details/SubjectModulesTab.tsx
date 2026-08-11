import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { type LearningModule } from "@/features/question-bank";
import { BookOpen, ExternalLink, FileText, Layers, Pencil, Plus, Trash2 } from "lucide-react";

interface SubjectModulesTabProps {
  category: any;
  modules: LearningModule[];
  isModulesLoading: boolean;
  canManage: boolean;
  onAddModule: () => void;
  onEditModule: (mod: LearningModule) => void;
  onDeleteModule: (mod: LearningModule) => void;
}

export default function SubjectModulesTab({
  category,
  modules,
  isModulesLoading,
  canManage,
  onAddModule,
  onEditModule,
  onDeleteModule,
}: SubjectModulesTabProps) {
  return (
    <div className="space-y-4 max-w-5xl animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <BookOpen size={18} className="text-primary" /> Learning Curriculum Modules
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Curriculum learning materials and study modules for {category?.name}.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={onAddModule}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 h-10 text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
          >
            <Plus size={16} /> Add Learning Module
          </Button>
        )}
      </div>

      {/* Modules Grid / List */}
      {isModulesLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : modules.length === 0 ? (
        <Card className="py-16 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-3xl p-8 bg-card">
          <Layers size={44} className="text-muted-foreground/40 stroke-[1.5]" />
          <p className="font-bold text-foreground text-sm">No Learning Modules Added</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            No learning modules created yet for this subject category.
          </p>
          {canManage && (
            <Button
              onClick={onAddModule}
              variant="outline"
              className="rounded-xl text-xs font-semibold h-9 mt-1 border-border"
            >
              <Plus size={14} className="mr-1.5" /> Create First Module
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((mod, idx) => (
            <Card
              key={mod.id}
              className="p-5 bg-card hover:bg-muted/40 border border-border rounded-2xl flex items-start justify-between gap-4 transition-all group shadow-2xs"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="size-9 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-extrabold shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors truncate">
                    {mod.title}
                  </h4>
                  {mod.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {mod.description}
                    </p>
                  )}

                  {mod.fileUrl && (
                    <a
                      href={mod.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline pt-1"
                    >
                      <FileText size={13} /> View Material Attachment
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditModule(mod)}
                    className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                    title="Edit Module"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteModule(mod)}
                    className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                    title="Delete Module"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
