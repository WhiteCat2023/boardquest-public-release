import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { ArrowLeft } from "lucide-react";
import ExtractedFilePreview from "./components/ExtractedFilePreview";
import UploadZone from "./components/UploadZone";
import { useExtractedQuestionsStore } from "../../../store/QuestionBankStore";

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
  // Local actions

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans">
      {/* Back link */}
      <button 
        onClick={() => {
          if (extractedQuestions.length > 0) {
            setExtractedQuestions([]);
          } else {
            navigate("/question-bank");
          }
        }}
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#A70202] transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        {extractedQuestions.length > 0 ? "Back to File Upload" : "Back to Question Bank"}
      </button>

      {extractedQuestions.length === 0 ? (
        <UploadZone categories={categories} />
      ) : (
        <ExtractedFilePreview />
      )}
    </div>
  );
}
