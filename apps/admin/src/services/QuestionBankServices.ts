import { useBulkUploadQuestionStore, useExtractedQuestionsStore } from "@/store/QuestionBankStore";
import { toast } from "sonner";
import { createProgressToast } from "@/utils/toast";
import { queryClient } from "@/lib/queryClient";

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

      let fileContent: string;
      let fileType: string;

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

  const totalCount = extractedQuestions.length;
  if (totalCount === 0) {
    toast.error("No questions to upload.");
    return;
  }
  setIsUploading(true);

  const progressToast = createProgressToast({
    id: "bulk-upload-progress",
    title: "Queuing Bulk Questions",
    totalCount,
  });

  // Upload in chunks of 10 to track real-time queueing progress
  const CHUNK_SIZE = 10;
  const chunks: any[][] = [];
  for (let i = 0; i < totalCount; i += CHUNK_SIZE) {
    chunks.push(extractedQuestions.slice(i, i + CHUNK_SIZE));
  }

  let processedCount = 0;
  let totalUploaded = 0;
  let totalSkippedDuplicates = 0;
  progressToast.update(0, totalCount, `Preparing ${totalCount} question(s) for queue...`);

  try {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const isLastChunk = i === chunks.length - 1;
      const startNum = processedCount + 1;
      const endNum = Math.min(totalCount, processedCount + chunk.length);

      progressToast.update(
        processedCount,
        totalCount,
        `Queuing questions ${startNum}–${endNum} of ${totalCount}...`
      );

      const res = await axiosPrivate.post("/questions/bulk-upload", {
        questions: chunk,
        categoryId: selectedCategoryId,
        silentNotification: !isLastChunk,
      });

      const chunkUploaded = res.data?.data?.count ?? chunk.length;
      const chunkSkipped = res.data?.data?.skippedDuplicates ?? 0;
      totalUploaded += chunkUploaded;
      totalSkippedDuplicates += chunkSkipped;

      processedCount += chunk.length;

      progressToast.update(
        processedCount,
        totalCount,
        `Processed ${processedCount} of ${totalCount} question(s)...`
      );

      // Brief delay between chunks for ultra-smooth UI feedback
      if (!isLastChunk) {
        await new Promise((res) => setTimeout(res, 200));
      }
    }

    if (totalUploaded > 0 && totalSkippedDuplicates > 0) {
      progressToast.warning(
        `Uploaded ${totalUploaded} question(s). ${totalSkippedDuplicates} duplicate question(s) already existed and were skipped.`,
        "Upload Complete (Duplicates Skipped)"
      );
    } else if (totalUploaded === 0 && totalSkippedDuplicates > 0) {
      progressToast.warning(
        `No questions were added. All ${totalSkippedDuplicates} question(s) already exist in this subject.`,
        "All Duplicates Skipped"
      );
    } else {
      progressToast.success(
        `All ${totalUploaded || totalCount} question(s) successfully queued and processed!`,
        "Upload Complete"
      );
    }

    // Invalidate questions, review desk, and categories so question list updates automatically
    queryClient.invalidateQueries({ queryKey: ["questions"] });
    queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard-questions"] });

    setExtractedQuestions([]);
    setFile(null);
    setSelectedCategoryId("");
    navigate(from, { replace: true });
  } catch (err: any) {
    progressToast.error(
      err.response?.data?.message || `Failed to queue questions at question #${processedCount + 1}.`,
      "Upload Failed"
    );
  } finally {
    setIsUploading(false);
  }
};