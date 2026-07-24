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
