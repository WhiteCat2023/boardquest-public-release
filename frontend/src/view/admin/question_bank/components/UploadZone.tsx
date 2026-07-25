
import useAuth from "../../../../hooks/useAuth";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomSelectWithLabel from "../../../../components/custom/select/Select";
import { SelectItem } from "@/components/ui/select";
import { Upload, Download, AlertCircle, HelpCircle, CheckCircle2, Play, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBulkUploadQuestionStore, useUploadZoneState } from "../../../../store/QuestionBankStore";
import { downloadSampleCSV } from "../../../../services/QuestionBankServices";

interface UploadZoneProps {
  categories: any[];
}

export default function UploadZone({ categories }: UploadZoneProps) {
  const { auth } = useAuth();
  const currentUserRole = (auth as any)?.data?.user?.role;
  const axiosPrivate = useAxiosPrivate();

  const {
    file,
    setFile,
    selectedCategoryId,
    setSelectedCategoryId,
    isExtracting,
    handleExtraction,
  } = useBulkUploadQuestionStore();

  const { handleDrag, handleDragLeave, handleDrop, handleFileChange, dragActive } = useUploadZoneState();
  const handleExtract = () => handleExtraction(axiosPrivate);

  return (
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
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Academic Subject</label>
              <CustomSelectWithLabel
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                label="Select Target Category"
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
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Role Constraint Status</label>
              <div className="h-11 flex items-center px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-semibold text-slate-600">
                {currentUserRole === "TEACHER" ? "Auto-Drafted (Pending Approval)" : "Bulk Pending Review"}
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Spreadsheet Attachment</label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDragLeave}
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
  );
}
