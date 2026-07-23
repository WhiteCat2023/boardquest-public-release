import { useState } from "react";
import { useCategories } from "@/view/admin/faculty/hooks/useFaculty";
import { Tag, Plus, Search, FolderPlus, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export default function CategoriesView() {
  const { data: categories = [], isLoading } = useCategories();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role;

  const canCreate = currentUserRole === "SUPERADMIN" || currentUserRole === "ADMIN";

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    try {
      await axiosPrivate.post("/questions/category/create", {
        name: newCategoryName.trim(),
      });
      toast.success(`Category "${newCategoryName}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setNewCategoryName("");
      setIsAddModalOpen(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create category.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in duration-200">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
          <Input
            type="text"
            placeholder="Search evaluation categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] shadow-2xs"
          />
        </div>

        {canCreate && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#A70202] text-white hover:bg-[#8e0202] rounded-xl px-5 h-11 text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
          >
            <Plus size={16} />
            Create New Category
          </Button>
        )}
      </div>

      {/* Grid of Categories */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 min-h-[170px]">
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32 bg-slate-200/80 rounded-md" />
                <Skeleton className="h-5 w-16 bg-slate-200/80 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48 bg-slate-200/80 rounded-md" />
              <div className="pt-4 flex justify-between items-center">
                <Skeleton className="h-4 w-24 bg-slate-200/80 rounded-md" />
                <Skeleton className="h-4 w-4 bg-slate-200/80 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-3xl p-8">
          <Tag size={44} className="text-slate-300 stroke-[1.5]" />
          <p className="font-bold text-slate-700 text-base">No Categories Found</p>
          <p className="text-xs max-w-sm text-slate-400">
            {searchTerm
              ? `No categories match "${searchTerm}".`
              : "No evaluation categories have been created yet."}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat: any) => (
            <Card
              key={cat.id}
              className="group relative bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-[#A70202]/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[170px]"
            >
              {/* Hover top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#A70202] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Background watermark icon */}
              <BookOpen className="absolute -right-4 -bottom-4 size-28 text-slate-100 opacity-40 group-hover:opacity-25 group-hover:scale-110 group-hover:text-[#A70202] transition-all duration-300 pointer-events-none" />

              <CardHeader className="p-0 space-y-0 relative z-10">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-[#A70202]/10 text-[#A70202] rounded-2xl border border-[#A70202]/15 shadow-2xs group-hover:bg-[#A70202] group-hover:text-white group-hover:scale-105 transition-all duration-300">
                      <BookOpen size={22} className="stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <CardTitle className="font-bold text-slate-800 text-base sm:text-lg leading-tight group-hover:text-[#A70202] transition-colors line-clamp-1">
                        {cat.name}
                      </CardTitle>
                      <Badge variant="outline" className="w-fit text-[10px] font-semibold text-slate-400 bg-slate-50 border-slate-200/80 px-2 py-0.5">
                        Subject Category
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardFooter className="p-0 pt-5 border-t border-slate-100 flex items-center justify-between border-b-0 bg-transparent relative z-10 mt-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                  <span className="size-2 rounded-full bg-[#A70202]" />
                  <span className="font-bold text-slate-800">{cat.questions?.length ?? 0}</span>
                  <span className="text-slate-400">{cat.questions?.length === 1 ? "Question" : "Questions"}</span>
                </div>

                <Badge variant="outline" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full border-0">
                  Active
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Category Modal */}
      {canCreate && (
        <AlertDialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <AlertDialogContent className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl max-w-md">
            <form onSubmit={handleCreateCategory}>
              <AlertDialogHeader className="text-left space-y-3">
                <div className="flex flex-row items-center gap-3">
                  <div className="p-2.5 bg-[#A70202]/10 text-[#A70202] rounded-2xl border border-[#A70202]/15 shrink-0">
                    <FolderPlus size={20} className="stroke-[2.5]" />
                  </div>
                  <AlertDialogTitle className="text-lg font-bold text-slate-800">
                    Create Subject Category
                  </AlertDialogTitle>
                </div>

                <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed">
                  Enter a unique title for the new subject category (e.g. Clinical Chemistry, Microbiology).
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="py-5">
                <Input
                  type="text"
                  required
                  placeholder="e.g. Hematology & Immunology"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="h-11 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
                />
              </div>

              <AlertDialogFooter className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <AlertDialogCancel
                  type="button"
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border-0 text-xs font-semibold px-4 py-2 cursor-pointer"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  type="submit"
                  disabled={isSubmitting || !newCategoryName.trim()}
                  className="rounded-xl bg-[#A70202] hover:bg-[#8e0202] text-white text-xs font-semibold px-5 py-2 cursor-pointer"
                >
                  {isSubmitting ? "Creating..." : "Save Category"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
