export interface ReviewCenterRepresentative {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  companyName: string;
  phonenumber: string;
  location?: string;
  createdAt: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface CreateReviewCenterPayload {
  employeeId: string;
  name: string;
  email: string;
  companyName: string;
  phonenumber: string;
  password?: string;
  location?: string;
}

export interface UpdateReviewCenterPayload {
  employeeId?: string;
  name?: string;
  email?: string;
  companyName?: string;
  phonenumber?: string;
  location?: string;
}

export interface ReviewSchedule {
  id: string;
  title: string;
  companyName: string;
  reviewCenterId?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  category?: string; // e.g. Board Review, Subject Mastery, Mock Exam, Intensive Coaching
  status?: string;   // ACTIVE, UPCOMING, COMPLETED
  description?: string;
  createdAt?: string;
}

export interface CreateReviewSchedulePayload {
  title: string;
  companyName: string;
  reviewCenterId?: string;
  startDate: string;
  endDate: string;
  category?: string;
  status?: string;
  description?: string;
}

export interface UpdateReviewSchedulePayload {
  title?: string;
  companyName?: string;
  reviewCenterId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  description?: string;
}
