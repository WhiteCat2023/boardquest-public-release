import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import rcAxios from "@/lib/axios";
import type {
  Assessment,
  AssessmentFilters,
  CreateAssessmentPayload,
  BulkUploadResponse,
  ScoreInputItem,
  GradeMatrixResponse,
  CandidateScoreTranscript,
} from "../types";

export function useAssessments(filters: AssessmentFilters = {}) {
  return useQuery<{ assessments: Assessment[] }>({
    queryKey: ["reviewCenterAssessments", filters],
    queryFn: async () => {
      const response = await rcAxios.get("/assessments", { params: filters });
      return response.data?.data || { assessments: [] };
    },
  });
}

export function useAssessment(id?: string) {
  return useQuery<{ assessment: Assessment }>({
    queryKey: ["reviewCenterAssessment", id],
    queryFn: async () => {
      if (!id) throw new Error("Assessment ID is required");
      const response = await rcAxios.get(`/assessments/${id}`);
      return response.data?.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateAssessmentPayload) => {
      const response = await rcAxios.post("/assessments", payload);
      return response.data?.data?.assessment as Assessment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessments"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterGradeMatrix"] });
    },
  });
}

export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAssessmentPayload> }) => {
      const response = await rcAxios.put(`/assessments/${id}`, data);
      return response.data?.data?.assessment as Assessment;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessments"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessment", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterGradeMatrix"] });
    },
  });
}

export function useDeleteAssessment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await rcAxios.delete(`/assessments/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessments"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterGradeMatrix"] });
    },
  });
}

export function useBulkSaveScores() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assessmentId,
      items,
    }: {
      assessmentId: string;
      items: ScoreInputItem[];
    }) => {
      const response = await rcAxios.post(`/assessments/${assessmentId}/scores/bulk`, { items });
      return response.data?.data as BulkUploadResponse;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessments"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessment", variables.assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterGradeMatrix"] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterCandidateScores"] });
    },
  });
}

export function useEmailGradeReports() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assessmentId,
      candidateIds,
    }: {
      assessmentId: string;
      candidateIds?: string[];
    }) => {
      const response = await rcAxios.post(`/assessments/${assessmentId}/email-reports`, {
        candidateIds,
      });
      return response.data?.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reviewCenterAssessment", variables.assessmentId] });
      queryClient.invalidateQueries({ queryKey: ["reviewCenterGradeMatrix"] });
    },
  });
}

export function useGradeMatrix(filters: {
  schoolYear?: string;
  subject?: string;
}) {
  return useQuery<GradeMatrixResponse>({
    queryKey: ["reviewCenterGradeMatrix", filters],
    queryFn: async () => {
      const response = await rcAxios.get("/assessments/matrix", { params: filters });
      return response.data?.data || { assessments: [], candidatesCount: 0, rows: [] };
    },
  });
}

export function useCandidateScores(candidateId?: string) {
  return useQuery<CandidateScoreTranscript>({
    queryKey: ["reviewCenterCandidateScores", candidateId],
    queryFn: async () => {
      if (!candidateId) throw new Error("Candidate ID is required");
      const response = await rcAxios.get(`/assessments/candidate/${candidateId}/scores`);
      return response.data?.data;
    },
    enabled: Boolean(candidateId),
  });
}

/**
 * Helper to trigger browser download of assessment CSV template
 */
export async function downloadAssessmentTemplate(assessmentId: string, assessmentTitle: string) {
  const response = await rcAxios.get(`/assessments/${assessmentId}/template`, {
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${assessmentTitle.toLowerCase().replace(/\s+/g, "_")}_roster_template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
