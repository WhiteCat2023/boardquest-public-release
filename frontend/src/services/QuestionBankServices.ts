import { useBulkUploadQuestionStore, useExtractedQuestionsStore } from "@/store/QuestionBankStore";
import { toast } from "sonner";

export const downloadSampleCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8,Question,Choices,CorrectAnswer,Topic,Difficulty,Type,Feedback\n" +
      '"What is the primary function of insulin?","Promotes glucose uptake;Increases gluconeogenesis;Stimulates glycogenolysis;Enhances lipolysis","Promotes glucose uptake","Carbohydrate Metabolism","Medium","MCQ","Insulin promotes glucose uptake in muscle and adipose tissue."\n' +
      '"Red blood cells contain nuclei.","","False","Hematology","Easy","True/False","Mature red blood cells are anucleated to pack maximum hemoglobin."\n' +
      '"Which organ filters blood to produce urine?","","Kidney","Renal Physiology","Easy","Short Answer","Kidneys filter toxins, excess water, and solutes to produce urine."';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "boardquest_questions_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Sample CSV template downloaded.");
  };
    
export const extractQuestions = async (axiosPrivate: any) => {
  const { file, selectedCategoryId, setIsExtracting } = useBulkUploadQuestionStore.getState();
  const { setExtractedQuestions } = useExtractedQuestionsStore.getState();


  if (!file) {
    toast.error("Please select a file to parse.");
    return;
  }
  if (!selectedCategoryId) {
    toast.error("Please select a target category.");
    return;
  }

  setIsExtracting(true);
  const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

  try {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const result = e.target?.result;
      if (!result) {
        toast.error("Failed to read file.");
        setIsExtracting(false);
        return;
      }

      let fileContent = "";
      let fileType = "csv";

      if (isExcel) {
        fileType = "excel";
        fileContent = (result as string).split(",")[1];
      } else {
        fileType = "csv";
        fileContent = result as string;
      }

      try {
        const response = await axiosPrivate.post("/questions/extract", {
          fileContent,
          fileType,
        });

        const extracted = response.data?.data?.questions || [];
        if (extracted.length === 0) {
          toast.warning("No questions could be extracted from the file.");
        } else {
          setExtractedQuestions(extracted);
          toast.success(`Successfully parsed ${extracted.length} questions. Please review them below.`);
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to extract questions.");
      } finally {
        setIsExtracting(false);
      }
    };

    if (isExcel) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  } catch (err: any) {
    toast.error("An error occurred during file extraction.");
    setIsExtracting(false);
  }
};

export const bulkUploadQuestions = async (axiosPrivate: any, navigate: any, from: string) => {
  const { extractedQuestions, setExtractedQuestions } = useExtractedQuestionsStore.getState();
  const { selectedCategoryId, setIsUploading, setFile, setSelectedCategoryId } = useBulkUploadQuestionStore.getState();

  if (extractedQuestions.length === 0) {
    toast.error("No questions to upload.");
    return;
  }
  setIsUploading(true);

  try {
    const response = await axiosPrivate.post("/questions/bulk-upload", {
      questions: extractedQuestions,
      categoryId: selectedCategoryId,
    });

    toast.success(response.data?.message || "All questions uploaded successfully!");
    setExtractedQuestions([]);
    setFile(null);
    setSelectedCategoryId("");
    navigate(from, { replace: true });
  } catch (err: any) {
    toast.error(err.response?.data?.message || "Failed to upload questions.");
  } finally {
    setIsUploading(false);
  }
};