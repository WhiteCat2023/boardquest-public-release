import { useState } from "react";
import { useCategories } from "@/view/admin/faculty/hooks/useFaculty";
import { Tag, Plus, Search, FolderPlus, BookOpen, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
            className="pl-10 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202]"
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
        <div className="py-20 text-center text-slate-400">
          <div className="animate-spin inline-block border-3 border-[#A70202] border-t-transparent rounded-full w-8 h-8 mb-3" />
          <p className="text-sm font-medium">Fetching evaluation categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center gap-3 bg-white border border-slate-200 rounded-3xl p-8">
          <Tag size={44} className="text-slate-300 stroke-[1.5]" />
          <p className="font-bold text-slate-700 text-base">No Categories Found</p>
          <p className="text-xs max-w-sm text-slate-400">
            {searchTerm
              ? `No categories match "${searchTerm}".`
              : "No evaluation categories have been created yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCategories.map((cat: any) => (
            <Card
              key={cat.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 group-hover:scale-105 transition-transform">
                    <BookOpen size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Subject Category
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Layers size={14} className="text-indigo-500" />
                  <span>
                    {cat.questions?.length ?? 0} {cat.questions?.length === 1 ? "Question" : "Questions"}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>
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
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
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
