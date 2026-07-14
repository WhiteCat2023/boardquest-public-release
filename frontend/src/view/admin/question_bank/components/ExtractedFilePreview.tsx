import { Card, CardContent } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import QuestionTable from "./table/questionTable";
import { useExtractedQuestionsStore, useBulkUploadQuestionStore, useEditBulkQuestionStore } from "../../../../store/QuestionBankStore";
import { CheckCircle2 } from "lucide-react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useNavigate, useLocation } from "react-router-dom";

function ExtractedFilePreview() {
    const { extractedQuestions, setExtractedQuestions } = useExtractedQuestionsStore();
    const { isUploading, handleBulkUpload } = useBulkUploadQuestionStore();
    const { editingIndex } = useEditBulkQuestionStore();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();
    
    const from = location.state?.from?.pathname || "/question-bank";

    const onUploadClick = () => {
        handleBulkUpload(axiosPrivate, navigate, from);
    };

    return (
      <div className="flex flex-col gap-6 w-full animate-in zoom-in-95 duration-200">
        <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
          {/* Header Bar */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Review Extracted Questions
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Double-check the questions below. You can edit entries inline or
                delete rows before saving.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#E9B0B0]/20 border border-[#E9B0B0]/30 text-[#A70202] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs shrink-0">
              <CheckCircle2 size={14} />
              {extractedQuestions.length} Questions Ready
            </div>
          </div>

          <CardContent className="p-0">
            <QuestionTable/>
          </CardContent>

          {/* Bottom Actions Bar */}
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-between gap-3.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExtractedQuestions([])}
              disabled={isUploading}
              className="cursor-pointer border-slate-200 hover:bg-slate-100 font-semibold px-6 py-2.5 rounded-xl h-auto"
            >
              Cancel & Re-upload
            </Button>

            <Button
              onClick={onUploadClick}
              disabled={isUploading || editingIndex !== null}
              className="bg-[#A70202] text-white hover:bg-[#8e0202] cursor-pointer font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 shadow-xs"
            >
              {isUploading ? (
                <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Upload {extractedQuestions.length} Questions to Bank
            </Button>
          </div>
        </Card>
      </div>
    );
}

export default ExtractedFilePreview