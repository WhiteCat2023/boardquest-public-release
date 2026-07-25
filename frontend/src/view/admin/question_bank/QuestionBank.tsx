import { useState, useEffect } from "react";
import QuestionList from "./components/list/QuestionList";
import { useQuestionBankFilterStore } from "@/store/QuestionBankStore";
import {
  Search,
  X,
  ArrowLeft,
  BookOpen,
  Grid,
  ArrowRight,
} from "lucide-react";
import AddQuestionButton from "../../../components/custom/button/AddQuestionButton";
import { Input } from "../../../components/ui/input";
import { QuestionFilter } from "./components/QuestionFilter";
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
    selectedStatus,
  } = useQuestionBankFilterStore();

  useEffect(() => {
    setSelectedCategory("");
  }, [view, setSelectedCategory]);

  const activeCategoryObj = categories.find(
    (cat: any) => cat.id === selectedCategory,
  );

  const filters: any = {
    search,
    category: selectedCategory === "ALL" ? undefined : selectedCategory,
    difficulty: selectedDifficulty,
    type: selectedType,
  };

  if (view === "my-questions") {
    filters.authorId = currentUserId;
    if (selectedStatus && selectedStatus !== "ALL") {
      filters.status = selectedStatus;
    }
  } else if (view === "published") {
    filters.isPublished = true;
    if (selectedStatus && selectedStatus !== "ALL") {
      filters.status = selectedStatus;
    }
  } else if (view === "revisions") {
    filters.status = "NEEDS_REVISION";
    if ((auth as any)?.data?.user?.role === "TEACHER") {
      filters.authorId = currentUserId;
    }
  } else {
    // Shared Library: exclude published questions, only show non-published items
    filters.isPublished = false;
    if (selectedStatus && selectedStatus !== "ALL") {
      filters.status = selectedStatus;
    }
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
          title: "Live Questions",
          desc: "Approved and published questions currently active for exams.",
        };
      case "revisions":
        return {
          title: "Revision Desk",
          desc: "Questions flagged by administrators requiring review edits.",
        };
      case "bank":
      default:
        return {
          title: "Shared Library",
          desc: "Browse and manage all evaluation questions in the shared repository.",
        };
    }
  };

  const header = getViewTitleAndDesc();

  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
      {selectedCategory && (
        <div className="flex items-center justify-between ms-[-20px]">
          <Button
            variant="ghost"
            onClick={() => setSelectedCategory("")}
            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Subject Categories
          </Button>

          {selectedCategory === "ALL" && (
            <Badge
              variant="outline"
              className="text-xs text-muted-foreground font-medium border-border"
            >
              Showing questions across all subject categories
            </Badge>
          )}
        </div>
      )}
      {/* Page header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 transition-colors duration-200 z-10 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            {header.title}
            {selectedCategory && (
              <Badge
                variant="outline"
                className="gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border-primary/20 shadow-2xs"
              >
                <BookOpen size={13} />
                {selectedCategory === "ALL"
                  ? "All Subjects"
                  : activeCategoryObj?.name || "Subject Filter"}
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{header.desc}</p>
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
              <Input
                type="text"
                placeholder="Search subjects / categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="pl-10 pr-9 h-11 bg-card border border-border rounded-xl text-sm focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground shadow-2xs"
              />
              {categorySearch && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCategorySearch("")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-8 w-8 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Select a subject category card below to view its question bank table
            </p>
          </div>

          {isCategoriesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <Card
                  key={i}
                  className="bg-card border border-border rounded-3xl p-6 space-y-4 min-h-[170px]"
                >
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-32 bg-muted rounded-md" />
                    <Skeleton className="h-5 w-16 bg-muted rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48 bg-muted rounded-md" />
                  <div className="pt-4 flex justify-between items-center">
                    <Skeleton className="h-4 w-24 bg-muted rounded-md" />
                    <Skeleton className="h-4 w-4 bg-muted rounded-md" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Option card to View All Questions */}
              <Card
                onClick={() => setSelectedCategory("ALL")}
                className="group relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground border border-primary/30 rounded-3xl p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden min-h-[170px]"
              >
                <div className="absolute -right-10 -bottom-10 size-36 rounded-full bg-primary-foreground/10 blur-xl pointer-events-none" />
                <Grid className="absolute -right-4 -bottom-4 size-28 text-primary-foreground opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-300 pointer-events-none" />

                <CardHeader className="p-0 space-y-0 relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-primary-foreground/15 text-primary-foreground rounded-2xl border border-primary-foreground/20 shadow-2xs group-hover:bg-primary-foreground group-hover:text-primary group-hover:scale-105 transition-all duration-300">
                        <Grid size={22} className="stroke-[2.2]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <CardTitle className="font-bold text-primary-foreground text-base sm:text-lg leading-tight">
                          All Subjects
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="w-fit text-[10px] font-semibold text-primary-foreground/90 bg-primary-foreground/10 border-primary-foreground/20 px-2 py-0.5"
                        >
                          Full Question Pool
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardFooter className="p-0 pt-5 border-t border-primary-foreground/15 flex items-center justify-between border-b-0 bg-transparent relative z-10 mt-4">
                  <span className="text-xs text-primary-foreground/80 font-medium">
                    Browse across all categories
                  </span>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-primary-foreground hover:bg-[transparent] rounded-xl text-xs font-bold px-3.5 h-9 transition-all duration-200 flex items-center gap-1.5 shadow-md cursor-pointer"
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
                  className="group relative bg-card border border-border rounded-3xl p-6 shadow-xs hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden min-h-[170px]"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <BookOpen className="absolute -right-4 -bottom-4 size-28 text-muted/50 opacity-40 group-hover:opacity-25 group-hover:scale-110 group-hover:text-primary transition-all duration-300 pointer-events-none" />

                  <CardHeader className="p-0 space-y-0 relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-primary/10 text-primary rounded-2xl border border-primary/15 shadow-2xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-105 transition-all duration-300">
                          <BookOpen size={22} className="stroke-[2.2]" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <CardTitle className="font-bold text-foreground text-base sm:text-lg leading-tight group-hover:text-primary transition-colors line-clamp-1">
                            {cat.name}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] font-semibold text-muted-foreground bg-muted border-border px-2 py-0.5"
                          >
                            Subject Category
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardFooter className="p-0 pt-5 border-t border-border flex items-center justify-between border-b-0 bg-transparent relative z-10 mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs font-medium text-foreground">
                      <span className="size-2 rounded-full bg-primary" />
                      <span className="font-bold text-foreground">
                        {cat.questions?.length ?? 0}
                      </span>
                      <span className="text-muted-foreground">
                        {cat.questions?.length === 1 ? "Question" : "Questions"}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-primary hover:bg-transparent rounded-xl text-xs font-semibold px-3.5 h-9 transition-all duration-200 flex items-center gap-1.5 shadow-2xs group-hover:shadow-md cursor-pointer"
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
        /* Question Table View */
        <div className="animate-in fade-in duration-150 space-y-4">
          <QuestionFilter />
          <QuestionList filters={filters} />
        </div>
      )}
    </div>
  );
}

export default QuestionBank;
