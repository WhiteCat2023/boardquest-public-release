import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ArrowLeft } from "lucide-react";
import ExtractedFilePreview from "./ExtractedFilePreview";
import UploadZone from "../components/UploadZone";
import { useExtractedQuestionsStore } from "@/store/QuestionBankStore";

export default function AddedQuestionUsingCSV() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const { extractedQuestions, setExtractedQuestions } = useExtractedQuestionsStore();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/category/get");
      return response.data?.data?.categories ?? response.data?.data ?? [];
    },
  });

  return (
    <div className="flex flex-col gap-3.5 p-4 md:p-6 w-full max-w-full animate-in fade-in duration-300 font-sans bg-background text-foreground">
      {/* Back link */}
      <button 
        type="button"
        onClick={() => {
          if (extractedQuestions.length > 0) {
            setExtractedQuestions([]);
          } else if (window.history.length > 1) {
            navigate(-1);
          } else {
            navigate("/question-bank");
          }
        }}
        className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors cursor-pointer w-fit group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      {extractedQuestions.length === 0 ? (
        <UploadZone categories={categories} />
      ) : (
        <ExtractedFilePreview />
      )}
    </div>
  );
}
