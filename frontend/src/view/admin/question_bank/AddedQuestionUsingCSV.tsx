import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Download,
  Trash2,
  Edit,
  Check,
  X,
  Plus,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import CustomSelectWithLabel from "../../../components/custom/select/Select";
import { SelectItem } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";
import { getDifficultyColor, getStatusColor } from "@/utils/style";

export default function AddedQuestionUsingCSV() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role;

  const [file, setFile] = useState<File | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Extracted preview state
  const [extractedQuestions, setExtractedQuestions] = useState<any[]>([]);

  // Inline edit state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editWording, setEditWording] = useState("");
  const [editChoices, setEditChoices] = useState("");
  const [editCorrectAnswer, setEditCorrectAnswer] = useState("");
  const [editTopic, setEditTopic] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("EASY");
  const [editType, setEditType] = useState("MCQ");
  const [editFeedback, setEditFeedback] = useState("");

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/category/get");
      return response.data?.data?.categories ?? response.data?.data ?? [];
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = [".csv", ".xlsx", ".xls"];
      const matchesType = validTypes.some(type => droppedFile.name.toLowerCase().endsWith(type));
      
      if (matchesType) {
        setFile(droppedFile);
      } else {
        toast.error("Invalid file format. Please upload a CSV or Excel file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Step 1: Extract questions to preview state
  const handleExtract = async () => {
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

  // Step 2: Finalize bulk upload
  const handleBulkUpload = async () => {
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
      navigate("/question-bank");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to upload questions.");
    } finally {
      setIsUploading(false);
    }
  };

  // Local inline editing triggers
  const startEdit = (index: number) => {
    const q = extractedQuestions[index];
    setEditingIndex(index);
    setEditWording(q.question);
    setEditChoices(q.choices.join("; "));
    setEditCorrectAnswer(q.correctAnswer);
    setEditTopic(q.topic);
    setEditDifficulty(q.difficulty);
    setEditType(q.type);
    setEditFeedback(q.feedback || "");
  };

  const saveEdit = (index: number) => {
    const choicesArr = editChoices.split(/[;|\n]/).map(c => c.trim()).filter(Boolean);
    
    if (!editWording.trim()) {
      toast.error("Question wording cannot be empty.");
      return;
    }
    if (!editCorrectAnswer.trim()) {
      toast.error("Correct answer is required.");
      return;
    }

    const updated = [...extractedQuestions];
    updated[index] = {
      ...updated[index],
      question: editWording.trim(),
      choices: choicesArr,
      correctAnswer: editCorrectAnswer.trim(),
      topic: editTopic.trim() || "General",
      difficulty: editDifficulty,
      type: editType,
      feedback: editFeedback.trim(),
    };
    setExtractedQuestions(updated);
    setEditingIndex(null);
    toast.success("Question updated locally.");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const deleteRow = (index: number) => {
    const updated = extractedQuestions.filter((_, idx) => idx !== index);
    setExtractedQuestions(updated);
    toast.info("Question removed from list.");
  };

  const downloadSampleCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,Question,Choices,CorrectAnswer,Topic,Difficulty,Type,Feedback\n"
      + "\"What is the primary function of insulin?\",\"Promotes glucose uptake;Increases gluconeogenesis;Stimulates glycogenolysis;Enhances lipolysis\",\"Promotes glucose uptake\",\"Carbohydrate Metabolism\",\"Medium\",\"MCQ\",\"Insulin promotes glucose uptake in muscle and adipose tissue.\"\n"
      + "\"Red blood cells contain nuclei.\",\"\",\"False\",\"Hematology\",\"Easy\",\"True/False\",\"Mature red blood cells are anucleated to pack maximum hemoglobin.\"\n"
      + "\"Which organ filters blood to produce urine?\",\"\",\"Kidney\",\"Renal Physiology\",\"Easy\",\"Short Answer\",\"Kidneys filter toxins, excess water, and solutes to produce urine.\"";
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "boardquest_questions_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info("Sample CSV template downloaded.");
  };

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
        /* STEP 1: UPLOAD & EXTRACTION SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
          {/* Bulk Upload Desk Card */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden flex flex-col">
            
            {/* Header Bar */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-red-50 text-[#A70202] border border-[#A70202]/10 shadow-xs">
                  <Upload size={22} className="stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">Bulk Question Importer</h2>
                  <p className="text-xs text-slate-400 font-medium">Extract questions from CSV/Excel and insert them directly into the question bank</p>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end text-xs text-slate-500 font-medium md:text-right border-l-2 md:border-l-0 md:border-r-2 border-[#A70202]/30 pl-3 md:pl-0 md:pr-3 py-0.5">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Authoring profile</span>
                <span className="text-slate-800 font-bold text-sm">{(auth as any)?.data?.user?.name || "Faculty Reviewer"}</span>
              </div>
            </div>

            {/* Form Body */}
            <div className="p-6 md:p-8 flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Academic Subject</label>
                  <CustomSelectWithLabel
                    value={selectedCategoryId}
                    onValueChange={setSelectedCategoryId}
                    placeholder="Select Target Category"
                  >
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </CustomSelectWithLabel>
                </div>

                {/* Status information */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Role Constraint Status</label>
                  <div className="h-11 flex items-center px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-600">
                    {currentUserRole === "TEACHER" ? "Auto-Drafted (Pending Approval)" : "Bulk Pending Review"}
                  </div>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1">Spreadsheet Attachment</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                    dragActive 
                      ? "border-[#A70202] bg-[#A70202]/5" 
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                  }`}
                >
                  <input
                    type="file"
                    id="import-file-input"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  {!file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 shadow-sm">
                        <Upload size={24} className="text-[#A70202]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">Drag and drop file here</p>
                        <p className="text-xs text-slate-400 mt-1">Supports CSV and Excel sheets (.csv, .xlsx, .xls)</p>
                      </div>
                      <Button variant="outline" className="mt-2 h-9 px-4 rounded-xl text-xs font-bold pointer-events-none">
                        Browse Files
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-150">
                      <div className="p-3 bg-[#E9B0B0]/20 rounded-xl border border-[#E9B0B0]/30 text-[#A70202] shadow-sm">
                        <FileSpreadsheet size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-[320px]">{file.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                        <CheckCircle2 size={12} />
                        Ready to import
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFile(null);
                  setSelectedCategoryId("");
                }}
                disabled={!file && !selectedCategoryId || isExtracting}
                className="cursor-pointer border-slate-200 hover:bg-slate-100 font-semibold px-6 py-2.5 rounded-xl h-auto"
              >
                Clear Fields
              </Button>
              
              <Button
                onClick={handleExtract}
                disabled={!file || !selectedCategoryId || isExtracting}
                className="bg-[#A70202] text-white hover:bg-[#8e0202] cursor-pointer font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 shadow-xs"
              >
                {isExtracting ? (
                  <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                ) : (
                  <Play size={16} />
                )}
                Extract & Preview Questions
              </Button>
            </div>

          </div>

          {/* Right Info Panels */}
          <div className="space-y-6">
            <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
                  <HelpCircle className="size-4 text-[#A70202]" />
                  Template Guide
                </CardTitle>
              </CardHeader>
              <Separator className="bg-slate-100" />
              <CardContent className="p-6 space-y-4 text-xs leading-relaxed text-slate-500">
                <p>Your spreadsheet file must start with a header row defining the columns exactly as follows:</p>
                
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono text-[10px] text-slate-600">
                  <div className="font-semibold text-slate-800 border-b border-slate-200 pb-1">Required Headers:</div>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Question</strong>: Question wording string</li>
                    <li><strong>Choices</strong>: Options list separated by a semicolon (<code>;</code>)</li>
                    <li><strong>CorrectAnswer</strong>: Must match one option exactly</li>
                    <li><strong>Topic</strong>: Topic tag name</li>
                    <li><strong>Difficulty</strong>: <code>Easy</code>, <code>Medium</code>, or <code>Hard</code></li>
                    <li><strong>Type</strong>: <code>MCQ</code>, <code>True/False</code>, or <code>Short Answer</code></li>
                    <li><strong>Feedback</strong>: Optional explanation text</li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <Button 
                    onClick={downloadSampleCSV}
                    variant="outline" 
                    className="w-full flex items-center justify-center gap-2 text-xs font-bold border-slate-200 rounded-xl h-10 hover:bg-slate-50 cursor-pointer"
                  >
                    <Download size={14} />
                    Download Sample CSV
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-100 shadow-sm rounded-3xl bg-red-50/30 overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[11px] font-bold text-[#A70202] flex items-center gap-2 uppercase tracking-wider">
                  <AlertCircle className="size-4 text-[#A70202]" />
                  Role Restriction Note
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-2 text-xs text-[#A70202]/80 leading-relaxed">
                If your account role is <strong>Teacher</strong>, all bulk-imported questions will save as <strong>Draft</strong> and remain in your private dashboard until approved by an Admin/Superadmin.
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* STEP 2: PREVIEW & LOCAL EDITING SCREEN */
        <div className="flex flex-col gap-6 w-full animate-in zoom-in-95 duration-200">
          <Card className="border border-slate-200 shadow-sm rounded-3xl bg-white overflow-hidden">
            {/* Header Bar */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">Review Extracted Questions</h2>
                <p className="text-xs text-slate-400 font-medium">Double-check the questions below. You can edit entries inline or delete rows before saving.</p>
              </div>
              <div className="flex items-center gap-2 bg-[#E9B0B0]/20 border border-[#E9B0B0]/30 text-[#A70202] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs shrink-0">
                <CheckCircle2 size={14} />
                {extractedQuestions.length} Questions Ready
              </div>
            </div>

            <CardContent className="p-0">
              <div className="relative w-full overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/30">
                    <TableRow className="border-b border-slate-100 hover:bg-transparent">
                      <TableHead className="w-[60px] text-xs font-bold text-slate-400 uppercase tracking-wider pl-6 py-4">Row</TableHead>
                      <TableHead className="min-w-[200px] text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Question</TableHead>
                      <TableHead className="min-w-[160px] text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Choices (MCQ)</TableHead>
                      <TableHead className="min-w-[120px] text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Correct Answer</TableHead>
                      <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Topic</TableHead>
                      <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Type</TableHead>
                      <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Difficulty</TableHead>
                      <TableHead className="w-[120px] text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-6 py-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedQuestions.map((q, idx) => {
                      const isEditing = editingIndex === idx;

                      return (
                        <TableRow key={idx} className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
                          {/* Row Index */}
                          <TableCell className="pl-6 py-4 font-semibold text-slate-400 text-xs">
                            {idx + 1}
                          </TableCell>

                          {/* Question Text */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <textarea
                                value={editWording}
                                onChange={(e) => setEditWording(e.target.value)}
                                className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-16 resize-none"
                              />
                            ) : (
                              <div className="flex flex-col gap-1 max-w-[280px]">
                                <span className="text-xs font-semibold text-slate-800 leading-relaxed block line-clamp-3">
                                  {q.question}
                                </span>
                                {q.feedback && (
                                  <span className="text-[10px] text-slate-400 italic font-medium line-clamp-1">
                                    Explanation: {q.feedback}
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>

                          {/* Choices */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <textarea
                                value={editChoices}
                                onChange={(e) => setEditChoices(e.target.value)}
                                placeholder="Choice A; Choice B; Choice C..."
                                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-16 resize-none"
                              />
                            ) : (
                              <div className="flex flex-wrap gap-1 max-w-[220px]">
                                {q.choices.length > 0 ? (
                                  q.choices.map((c: string, cIdx: number) => (
                                    <span key={cIdx} className="bg-slate-100 border border-slate-200/50 text-[10px] font-medium text-slate-600 px-2 py-0.5 rounded-md">
                                      {c}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic font-medium">None</span>
                                )}
                              </div>
                            )}
                          </TableCell>

                          {/* Correct Answer */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <input
                                value={editCorrectAnswer}
                                onChange={(e) => setEditCorrectAnswer(e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9"
                              />
                            ) : (
                              <span className="text-xs font-bold text-slate-800 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                                {q.correctAnswer}
                              </span>
                            )}
                          </TableCell>

                          {/* Topic */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <input
                                value={editTopic}
                                onChange={(e) => setEditTopic(e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9"
                              />
                            ) : (
                              <span className="text-xs font-medium text-slate-600">
                                {q.topic || "General"}
                              </span>
                            )}
                          </TableCell>

                          {/* Type */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <select
                                value={editType}
                                onChange={(e) => setEditType(e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9 bg-white cursor-pointer"
                              >
                                <option value="MCQ">MCQ</option>
                                <option value="TRUE_FALSE">True/False</option>
                                <option value="SHORT_ANSWER">Short Answer</option>
                              </select>
                            ) : (
                              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                                {q.type}
                              </span>
                            )}
                          </TableCell>

                          {/* Difficulty */}
                          <TableCell className="py-4">
                            {isEditing ? (
                              <select
                                value={editDifficulty}
                                onChange={(e) => setEditDifficulty(e.target.value)}
                                className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9 bg-white cursor-pointer"
                              >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                              </select>
                            ) : (
                              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getDifficultyColor(q.difficulty)}`}>
                                {q.difficulty}
                              </span>
                            )}
                          </TableCell>

                          {/* Actions */}
                          <TableCell className="pr-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => saveEdit(idx)}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-600 shadow-xs hover:bg-emerald-50 focus:outline-none cursor-pointer"
                                    title="Save changes"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-slate-50 focus:outline-none cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => startEdit(idx)}
                                    disabled={editingIndex !== null}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-slate-50 hover:text-slate-700 focus:outline-none cursor-pointer disabled:opacity-50"
                                    title="Edit Row"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => deleteRow(idx)}
                                    disabled={editingIndex !== null}
                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 shadow-xs hover:bg-rose-50 hover:text-rose-600 focus:outline-none cursor-pointer disabled:opacity-50"
                                    title="Delete Row"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
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
                onClick={handleBulkUpload}
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
      )}
    </div>
  );
}
