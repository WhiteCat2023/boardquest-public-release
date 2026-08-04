export interface Achievement {
  id: string;
  userId: string;
  task: string;
  type: "quest" | "exam" | string;
  badge?: string;
  xp: number;
  confidenceLevel?: "Shaky" | "Steady" | "Unyielding" | string;
  accuracy?: number;
  questMode?: "learning" | "test" | string;
  subject?: string;
  timestamp: string;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  level: number;
  xp: number;
  streak: number;
  location?: string;
  createdAt: string;
  mastery?: any[];
  studyPlans?: any[];
  achievements?: Achievement[];
  examResults?: any[];
  lessonCompletions?: any[];
}
