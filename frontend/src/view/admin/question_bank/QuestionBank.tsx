import { useState, useEffect } from "react";
import QuestionList from "./components/list/QuestionList";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import {
  Search,
  X,
  ArrowLeft,
  BookOpen,
  Layers,
  Grid,
  ArrowRight,
} from "lucide-react";
import AddQuestionButton from "../../../components/custom/button/AddQuestionButton";
import { Input } from "../../../components/ui/input";
import FilterDropdown from "./components/dropdown/Filter";
import { Separator } from "../../../components/ui/separator";
import { useSearchParams } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useCategories } from "@/view/admin/faculty/hooks/useFaculty";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

function QuestionBank() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get("view") || "bank";
  const { auth } = useAuth();
  const currentUserId = (auth as any)?.data?.user?.id;

  const { data: categories = [], isLoading: isCategoriesLoading } =
    useCategories();
  const [categorySearch, setCategorySearch] = useState("");

  const {
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    selectedDifficulty,
    selectedType,
  } = useQuestionBankFilterStore();

  // Reset selected category when switching views (e.g. Live Questions vs Shared Library)
  useEffect(() => {
    setSelectedCategory("");
  }, [view, setSelectedCategory]);

  // Active category object if a specific category is selected
  const activeCategoryObj = categories.find(
    (cat: any) => cat.id === selectedCategory,
  );

  // Compile dynamic filters based on active sidebar view
  const filters: any = {
    search,
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    difficulty: selectedDifficulty,
    type: selectedType,
  };

  if (view === "my-questions") {
    filters.authorId = currentUserId;
  } else if (view === "published") {
    filters.isPublished = true;
  } else if (view === "revisions") {
    filters.status = "NEEDS_REVISION";
    if ((auth as any)?.data?.user?.role === "TEACHER") {
      filters.authorId = currentUserId;
    }
  } else {
    filters.status = "APPROVED";
  }

  const getViewTitleAndDesc = () => {
    switch (view) {
      case "my-questions":
        return {
          title: "My Questions",
          desc: "Browse and manage draft questions authored by you.",
        };
      case "published":
        return {
          title: "Published Questions",
          desc: "Questions currently active and visible to students.",
        };
      case "revisions":
        return {
          title: "Revision Desk",
          desc: "Questions flagged by administrators requiring review edits.",
        };
      case "bank":
      default:
        return {
          title: "Question Bank Pool",
          desc: "Browse and manage all approved evaluation questions.",
        };
    }
  };

  const header = getViewTitleAndDesc();

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full">
      {selectedCategory && (
        <div className="flex items-center justify-between ms-[-20px]">
          <Button
            variant="ghost"
            onClick={() => setSelectedCategory("")}
            className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Subject Categories
          </Button>

          {selectedCategory === "ALL" && (
            <Badge
              variant="muted"
              className="text-xs text-slate-400 font-medium"
            >
              Showing questions across all subject categories
            </Badge>
          )}
        </div>
      )}
      {/* Page header */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 transition-colors duration-200 z-10">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
            {header.title}
            {selectedCategory && (
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1 bg-[#A70202]/10 text-[#A70202] text-xs font-semibold rounded-full border-[#A70202]/20 shadow-2xs"
              >
                <BookOpen size={13} />
                {selectedCategory === "ALL"
                  ? "All Subjects"
                  : activeCategoryObj?.name || "Subject Filter"}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{header.desc}</p>
        </div>

        <div className="flex items-center gap-3">
          <AddQuestionButton />
        </div>
      </div>

      {/* If no category is selected, show Category / Subject Cards */}
      {!selectedCategory ? (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <Input
                type="text"
                placeholder="Search subjects / categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-10 pr-9 h-11 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] shadow-2xs"
              />
              {categorySearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCategorySearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-8 w-8 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Select a subject category card below to view its question bank
              table
            </p>
          </div>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 min-h-[170px]"
                >
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Option card to View All Questions */}
              <Card
                onClick={() => setSelectedCategory("ALL")}
                className="group relative bg-gradient-to-br from-[#8A0101] via-[#A70202] to-[#6E0000] text-white border border-red-900/30 rounded-3xl p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden min-h-[170px]"
              >
                {/* Decorative background elements */}
                <div className="absolute -right-10 -bottom-10 size-36 rounded-full bg-white/10 blur-xl pointer-events-none" />
                <Grid className="absolute -right-4 -bottom-4 size-28 text-white opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none" />

                <CardHeader className="p-0 space-y-0 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-white/15 text-white rounded-2xl border border-white/20 shadow-2xs group-hover:bg-white group-hover:text-[#A70202] group-hover:scale-105 transition-all duration-300">
                        <Grid size={22} className="stroke-[2.2]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <CardTitle className="font-bold text-white text-base sm:text-lg leading-tight">
                          All Subjects
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="w-fit text-[10px] font-semibold text-red-100 bg-white/10 border-white/20 px-2 py-0.5"
                        >
                          Full Question Pool
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter className="p-0 pt-5 border-t border-white/15 flex items-center justify-between border-b-0 bg-transparent relative z-10 mt-4">
                  <span className="text-xs text-red-100 font-medium">
                    Browse across all categories
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white hover:bg-[transparent] rounded-xl text-xs font-bold px-3.5 h-9 transition-all duration-200 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <span>Explore All</span>
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Button>
                </CardFooter>
              </Card>

              {filteredCategories.map((cat: any) => (
                <Card
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="group relative bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-[#A70202]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden min-h-[170px]"
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
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] font-semibold text-slate-400 bg-slate-50 border-slate-200/80 px-2 py-0.5"
                          >
                            Subject Category
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter className="p-0 pt-5 border-t border-slate-100 flex items-center justify-between border-b-0 bg-transparent relative z-10 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-600">
                      <span className="size-2 rounded-full bg-[#A70202]" />
                      <span className="font-bold text-slate-800">
                        {cat.questions?.length ?? 0}
                      </span>
                      <span className="text-slate-400">
                        {cat.questions?.length === 1 ? "Question" : "Questions"}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className=" text-[#A70202] hover:bg-[transparent] rounded-xl text-xs font-semibold px-3.5 h-9 transition-all duration-200 flex items-center gap-1.5 shadow-2xs group-hover:shadow-md cursor-pointer"
                    >
                      <span>View Questions</span>
                      <ArrowRight
                        size={14}
                        className="group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* When a Category is Selected, display Question Table with Back Button */
        <div className="animate-in fade-in duration-150">
          <div className="flex gap-2 items-center w-full max-w-2xl mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <Input
                type="text"
                placeholder="Search questions by wording, topic, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-9 h-10 w-full bg-white border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150"
              />
              {search && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearch("")}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 h-8 w-8 rounded-lg cursor-pointer"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
            <FilterDropdown />
          </div>
          <Separator />
          <QuestionList filters={filters} />
        </div>
      )}
    </div>
  );
}

export default QuestionBank;
