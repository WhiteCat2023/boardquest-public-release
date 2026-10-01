import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type LearningModule } from "@/features/question-bank";
import {
  BookOpen,
  ExternalLink,
  FileText,
  Layers,
  Pencil,
  Plus,
  Trash2,
  Eye,
  Paperclip,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Search,
  X,
} from "lucide-react";
import { getFileNameFromUrl } from "../../services/moduleUploadService";
import { PdfPreviewModal } from "./PdfPreviewModal";

export type ModuleSortOptionKey =
  | "order-asc"
  | "order-desc"
  | "title-asc"
  | "title-desc"
  | "date-desc"
  | "date-asc";

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
  const [previewFile, setPreviewFile] = useState<{ url: string; name: string; title?: string } | null>(
    null
  );
  const [sortOption, setSortOption] = useState<ModuleSortOptionKey>("order-asc");
  const [searchQuery, setSearchQuery] = useState("");

  const sortDirection = sortOption.endsWith("-desc") ? "desc" : "asc";
  const sortBy = sortOption.startsWith("title")
    ? "title"
    : sortOption.startsWith("date")
    ? "date"
    : "order";

  const toggleSortDirection = () => {
    setSortOption((current) => {
      switch (current) {
        case "order-asc":
          return "order-desc";
        case "order-desc":
          return "order-asc";
        case "title-asc":
          return "title-desc";
        case "title-desc":
          return "title-asc";
        case "date-asc":
          return "date-desc";
        case "date-desc":
          return "date-asc";
        default:
          return "order-desc";
      }
    });
  };

  const sortedModules = useMemo(() => {
    let list = [...modules];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q))
      );
    }

    const getOrderNum = (mod: LearningModule, index: number) => {
      if (typeof mod.order === "number" && mod.order > 0) {
        return mod.order;
      }
      const match =
        mod.title.match(/module\s*(\d+)/i) || mod.title.match(/\b(\d+)\b/);
      if (match) {
        return parseInt(match[1], 10);
      }
      return index + 1;
    };

    const indexed = list.map((mod, originalIndex) => ({
      mod,
      originalIndex,
      displayNum: getOrderNum(mod, originalIndex),
    }));

    indexed.sort((a, b) => {
      let comparison = 0;

      if (sortBy === "order") {
        comparison = a.displayNum - b.displayNum;
        if (comparison === 0) {
          comparison = a.mod.title.localeCompare(b.mod.title, undefined, {
            numeric: true,
            sensitivity: "base",
          });
        }
      } else if (sortBy === "title") {
        comparison = a.mod.title.localeCompare(b.mod.title, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      } else if (sortBy === "date") {
        const dateA = a.mod.createdAt ? new Date(a.mod.createdAt).getTime() : 0;
        const dateB = b.mod.createdAt ? new Date(b.mod.createdAt).getTime() : 0;
        comparison = dateA - dateB;
      }

      if (comparison === 0) {
        comparison = a.originalIndex - b.originalIndex;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return indexed;
  }, [modules, sortBy, sortDirection, searchQuery]);

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

        <div className="flex flex-wrap items-center gap-2">
          {modules.length > 0 && (
            <div className="flex items-center gap-1.5">
              {/* Sort Dropdown */}
              {/* <Select
                value={sortOption}
                onValueChange={(val: ModuleSortOptionKey) => setSortOption(val)}
              >
                <SelectTrigger className="h-9 w-[185px] bg-background border-border rounded-xl text-xs font-semibold cursor-pointer">
                  <ArrowUpDown size={13} className="text-muted-foreground mr-1.5 shrink-0" />
                  <SelectValue placeholder="Sort modules" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="order-asc">Order: Ascending (1 → 9)</SelectItem>
                  <SelectItem value="order-desc">Order: Descending (9 → 1)</SelectItem>
                  <SelectItem value="title-asc">Title: A → Z</SelectItem>
                  <SelectItem value="title-desc">Title: Z → A</SelectItem>
                  <SelectItem value="date-desc">Date: Newest First</SelectItem>
                  <SelectItem value="date-asc">Date: Oldest First</SelectItem>
                </SelectContent>
              </Select> */}

              {/* Quick Ascending / Descending Toggle Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleSortDirection}
                className="h-9 px-3 rounded-xl border-border bg-background hover:bg-muted text-xs font-semibold gap-1.5 cursor-pointer shadow-2xs transition-all"
                title={`Currently sorted ${sortDirection === "asc" ? "Ascending" : "Descending"}. Click to sort ${sortDirection === "asc" ? "Descending" : "Ascending"}.`}
              >
                {sortDirection === "asc" ? (
                  <>
                    <ArrowUp size={14} className="text-primary stroke-[2.5]" />
                    <span>A-Z</span>
                  </>
                ) : (
                  <>
                    <ArrowDown size={14} className="text-primary stroke-[2.5]" />
                    <span>Z-A</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {canManage && (
            <Button
              onClick={onAddModule}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4 h-9 text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-xs"
            >
              <Plus size={16} /> Add Learning Module
            </Button>
          )}
        </div>
      </div>

      {/* Modules Grid / List */}
      {isModulesLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
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
              className="rounded-xl text-xs font-semibold h-9 mt-1 border-border cursor-pointer"
            >
              <Plus size={14} className="mr-1.5" /> Create First Module
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Quick Search Toolbar when there are multiple modules */}
          {modules.length > 2 && (
            <div className="relative">
              <Search
                size={14}
                className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <Input
                type="text"
                placeholder="Search modules by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 pr-8 text-xs bg-card border-border rounded-xl placeholder:text-muted-foreground/60 shadow-2xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {sortedModules.length === 0 ? (
            <Card className="py-12 text-center flex flex-col items-center justify-center gap-3 border border-dashed border-border rounded-2xl p-6 bg-card">
              <Search size={32} className="text-muted-foreground/40 stroke-[1.5]" />
              <p className="font-bold text-foreground text-xs">
                No matching modules found
              </p>
              <p className="text-[11px] text-muted-foreground">
                No modules match your search query &quot;{searchQuery}&quot;.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="rounded-xl text-xs font-semibold h-8 mt-1 border-border cursor-pointer"
              >
                Clear Search
              </Button>
            </Card>
          ) : (
            sortedModules.map(({ mod, displayNum }) => {
              const attachedUrls = Array.isArray(mod.fileUrls) ? mod.fileUrls : [];

              return (
                <Card
                  key={mod.id}
                  className="p-5 bg-card hover:bg-muted/30 border border-border rounded-2xl flex flex-col sm:flex-row items-start justify-between gap-4 transition-all group shadow-2xs"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <div className="size-9 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-sm font-extrabold shrink-0 mt-0.5">
                      {displayNum}
                    </div>
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-foreground leading-snug group-hover:text-primary transition-colors">
                        {mod.title}
                      </h4>
                      {attachedUrls.length > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <FileText size={10} />
                          {attachedUrls.length} {attachedUrls.length === 1 ? "PDF Material" : "PDF Materials"}
                        </span>
                      )}
                    </div>

                    {mod.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {mod.description}
                      </p>
                    )}

                    {/* Attached PDF Materials List with PREVIEW BUTTONS */}
                    {attachedUrls.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold text-foreground/80 flex items-center gap-1">
                          <Paperclip size={11} className="text-primary" /> Study Documents:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {attachedUrls.map((url, uIdx) => {
                            const docName = getFileNameFromUrl(
                              url,
                              `Module Material ${uIdx + 1}.pdf`
                            );
                            return (
                              <div
                                key={`${url}-${uIdx}`}
                                className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/80 text-xs gap-2 hover:border-primary/40 transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="size-6 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                                    <FileText size={12} className="stroke-[2.5]" />
                                  </div>
                                  <span
                                    className="font-medium text-foreground truncate max-w-[150px] sm:max-w-[190px]"
                                    title={docName}
                                  >
                                    {docName}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  {/* PREVIEW BUTTON */}
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      setPreviewFile({
                                        url,
                                        name: docName,
                                        title: `${mod.title} &bull; ${docName}`,
                                      })
                                    }
                                    className="h-6 px-1 rounded-md border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary text-[10px] font-bold gap-1 cursor-pointer"
                                    title="Preview PDF Document"
                                  >
                                    <Eye size={11} />
                                  </Button>

                                  <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="size-6 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
                                    title="Open in new tab"
                                  >
                                    <a href={url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink size={11} />
                                    </a>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
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
            );
          })
        )}
      </div>
    )}

      {/* Shared PDF Preview Modal */}
      <PdfPreviewModal
        isOpen={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        fileUrl={previewFile?.url || null}
        fileName={previewFile?.name}
        title={previewFile?.title}
      />
    </div>
  );
}
