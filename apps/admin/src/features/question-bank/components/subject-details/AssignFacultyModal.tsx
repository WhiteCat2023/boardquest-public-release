import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, ShieldCheck, Users, Loader2 } from "lucide-react";
import { useUsers } from "@/features/users";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AssignFacultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  currentHandlerIds: string[];
}

export function AssignFacultyModal({
  isOpen,
  onClose,
  categoryId,
  categoryName,
  currentHandlerIds,
}: AssignFacultyModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const { data: facultyData, isLoading } = useUsers({ search: searchTerm });
  const rawFaculties = facultyData?.faculties || [];
  const faculties = rawFaculties.filter((f) => {
    const roleStr = String(f.role || "").toUpperCase();
    return roleStr !== "REVIEWCENTER" && roleStr !== "EXTERNAL";
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(currentHandlerIds || []);
    }
  }, [isOpen, currentHandlerIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const saveMutation = useMutation({
    mutationFn: async (handlerIds: string[]) => {
      return await axiosPrivate.put(
        `/questions/category/single/${categoryId}/handlers`,
        {
          handlerIds,
        },
      );
    },
    onMutate: async (newHandlerIds: string[]) => {
      onClose();

      await queryClient.cancelQueries({
        queryKey: ["categoryDetail", categoryId],
      });
      await queryClient.cancelQueries({ queryKey: ["category", categoryId] });
      await queryClient.cancelQueries({ queryKey: ["categories"] });

      const previousCategoryDetail = queryClient.getQueryData([
        "categoryDetail",
        categoryId,
      ]);
      const previousCategory = queryClient.getQueryData([
        "category",
        categoryId,
      ]);
      const previousCategories = queryClient.getQueryData(["categories"]);

      const selectedHandlers = faculties
        .filter((f) => newHandlerIds.includes(f.id))
        .map((f) => ({
          id: f.id,
          name: f.name,
          email: f.email,
          role: f.role,
        }));

      const updateCategoryObj = (old: any) => {
        if (!old) return old;
        const categoryData = old.data || old;
        const updated = {
          ...categoryData,
          handlerIds: newHandlerIds,
          handlers: selectedHandlers,
        };
        return old.data ? { ...old, data: updated } : updated;
      };

      queryClient.setQueryData(
        ["categoryDetail", categoryId],
        updateCategoryObj,
      );
      queryClient.setQueryData(["category", categoryId], updateCategoryObj);

      queryClient.setQueryData(["categories"], (old: any) => {
        if (!old) return old;
        const list = Array.isArray(old)
          ? old
          : old.categories || old.data || [];
        const updatedList = list.map((cat: any) =>
          cat.id === categoryId
            ? { ...cat, handlerIds: newHandlerIds, handlers: selectedHandlers }
            : cat,
        );
        return Array.isArray(old)
          ? updatedList
          : { ...old, categories: updatedList };
      });

      toast.success(`Updated faculty handlers for ${categoryName}`);

      return { previousCategoryDetail, previousCategory, previousCategories };
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousCategoryDetail) {
        queryClient.setQueryData(
          ["categoryDetail", categoryId],
          context.previousCategoryDetail,
        );
      }
      if (context?.previousCategory) {
        queryClient.setQueryData(
          ["category", categoryId],
          context.previousCategory,
        );
      }
      if (context?.previousCategories) {
        queryClient.setQueryData(["categories"], context.previousCategories);
      }
      toast.error(
        err.response?.data?.message ||
          "Failed to update assigned faculty handlers",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["categoryDetail", categoryId],
      });
      queryClient.invalidateQueries({ queryKey: ["category", categoryId] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["faculties"] });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(selectedIds);
  };

  const filteredFaculties = faculties;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg p-5">
        <DialogHeader className="pb-2 border-b border-border">
          <DialogTitle className="text-base font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" /> Assign Subject
            Handlers
          </DialogTitle>
          <DialogDescription className="text-xs">
            Select users authorized to manage questions and modules for{" "}
            <strong className="text-foreground">{categoryName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>

          {/* Selected count info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span>Users</span>
            <span className="font-semibold text-primary">
              {selectedIds.length} Selected
            </span>
          </div>

          {/* User list container */}
          <div className="max-h-60 overflow-y-auto border border-border rounded-xl divide-y divide-border/60 bg-muted/20">
            {isLoading ? (
              <div className="p-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />{" "}
                Loading users roster...
              </div>
            ) : filteredFaculties.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-1">
                <Users className="w-6 h-6 text-muted-foreground/40" />
                <p>No users found matching your search.</p>
              </div>
            ) : (
              filteredFaculties.map((faculty) => {
                const isChecked = selectedIds.includes(faculty.id);
                const initials = faculty.name
                  ? faculty.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()
                  : "FC";

                return (
                  <label
                    key={faculty.id}
                    className={`p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors hover:bg-accent/40 ${
                      isChecked ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => toggleSelect(faculty.id)}
                      />
                      <div className="size-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-[10px] shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {faculty.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {faculty.email}
                        </p>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase font-mono shrink-0"
                    >
                      {faculty.role || "TEACHER"}
                    </Badge>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter className="pt-2 border-t border-border flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="h-8 text-xs font-semibold gap-1.5 shadow-2xs"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" /> Confirm Assignments
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
