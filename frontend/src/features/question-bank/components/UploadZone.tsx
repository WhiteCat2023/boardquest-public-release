import useAuth from "@/hooks/useAuth";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CustomSelectWithLabel from "@/components/custom/select/Select";
import { SelectItem } from "@/components/ui/select";
import { Upload, Download, AlertCircle, HelpCircle, CheckCircle2, Play, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useBulkUploadQuestionStore, useUploadZoneState } from "@/store/QuestionBankStore";
import { downloadSampleCSV } from "@/services/QuestionBankServices";

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start w-full font-sans">
      {/* Bulk Upload Desk Card */}
      <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="p-4 md:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
              <Upload size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">Bulk Question Importer</h2>
              <p className="text-xs text-muted-foreground font-medium">Extract questions from CSV/Excel and insert them directly into the question bank</p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end text-xs text-muted-foreground font-medium md:text-right border-l-2 md:border-l-0 md:border-r-2 border-primary/30 pl-3 md:pl-0 md:pr-3 py-0.5">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Authoring profile</span>
            <span className="text-foreground font-bold text-sm">{(auth as any)?.data?.user?.name || "Faculty Reviewer"}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 md:p-6 flex flex-col gap-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Category select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Academic Subject</label>
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
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Role Constraint Status</label>
              <div className="h-10 flex items-center px-3.5 rounded-xl border border-border bg-muted/30 text-xs font-semibold text-foreground/80">
                {currentUserRole === "TEACHER" ? "Auto-Drafted (Pending Approval)" : "Bulk Pending Review"}
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pl-1">Spreadsheet Attachment</label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                dragActive 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/40 bg-muted/20"
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
                <div className="flex flex-col items-center gap-2.5">
                  <div className="p-2.5 bg-card rounded-xl border border-border text-primary shadow-2xs">
                    <Upload size={22} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Drag and drop file here</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Supports CSV and Excel sheets (.csv, .xlsx, .xls)</p>
                  </div>
                  <Button variant="outline" className="mt-1 h-8 px-3.5 rounded-lg text-xs font-bold pointer-events-none bg-muted/40 border-border text-foreground">
                    Browse Files
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 animate-in zoom-in-95 duration-150">
                  <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary shadow-2xs">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-[300px]">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={11} />
                    Ready to import
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 md:p-5 border-t border-border bg-muted/40 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFile(null);
              setSelectedCategoryId("");
            }}
            disabled={(!file && !selectedCategoryId) || isExtracting}
            className="cursor-pointer border-border bg-muted/30 hover:bg-accent text-foreground font-semibold px-4 h-9 rounded-xl text-xs"
          >
            Clear Fields
          </Button>
          
          <Button
            onClick={handleExtract}
            disabled={!file || !selectedCategoryId || isExtracting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-5 h-9 rounded-xl text-xs flex items-center gap-2 shadow-2xs"
          >
            {isExtracting ? (
              <Spinner size="xs" variant="current" />
            ) : (
              <Play size={14} />
            )}
            Extract & Preview Questions
          </Button>
        </div>

      </div>

      {/* Right Info Panels */}
      <div className="space-y-4">
        {/* Template Guide Panel */}
        <Card className="border border-border shadow-xs rounded-2xl bg-card overflow-hidden">
          <CardHeader className="p-4 pb-3">
            <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <HelpCircle className="size-4 text-primary" />
              Template Guide
            </CardTitle>
          </CardHeader>
          <Separator className="bg-border" />
          <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-muted-foreground">
            <p>Your spreadsheet file must start with a header row defining the columns exactly as follows:</p>
            
            <div className="space-y-2 bg-muted/40 p-3 rounded-xl border border-border font-mono text-[10px] text-foreground">
              <div className="font-semibold text-foreground border-b border-border pb-1">Required Headers:</div>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                <li><strong className="text-foreground">Question</strong>: Question wording string</li>
                <li><strong className="text-foreground">Choices</strong>: Options list separated by a semicolon (<code>;</code>)</li>
                <li><strong className="text-foreground">CorrectAnswer</strong>: Must match one option exactly</li>
                <li><strong className="text-foreground">Topic</strong>: Topic tag name</li>
                <li><strong className="text-foreground">Difficulty</strong>: <code>Easy</code>, <code>Medium</code>, or <code>Hard</code></li>
                <li><strong className="text-foreground">Type</strong>: <code>MCQ</code>, <code>True/False</code>, or <code>Short Answer</code></li>
                <li><strong className="text-foreground">Feedback</strong>: Optional explanation text</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Button 
                onClick={downloadSampleCSV}
                variant="outline" 
                className="w-full flex items-center justify-center gap-2 text-xs font-bold border-border bg-muted/30 hover:bg-accent text-foreground rounded-xl h-8 cursor-pointer"
              >
                <Download size={13} />
                Download Sample CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role Restriction Note Panel */}
        <Card className="border border-amber-500/20 shadow-xs rounded-2xl bg-amber-500/10 text-foreground overflow-hidden">
          <CardHeader className="p-4 pb-1.5">
            <CardTitle className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertCircle className="size-4 text-amber-500" />
              Role Restriction Note
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
            If your account role is <strong>Teacher</strong>, all bulk-imported questions will save as <strong>Draft</strong> and remain in your private dashboard until approved by an Admin/Superadmin.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
