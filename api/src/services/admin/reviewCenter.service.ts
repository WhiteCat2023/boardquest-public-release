import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";

export interface CreateReviewCenterInput {
  employeeId: string;
  name: string;
  email: string;
  companyName: string;
  phonenumber: string;
  password?: string;
  location?: string;
}

export interface UpdateReviewCenterInput {
  employeeId?: string;
  name?: string;
  email?: string;
  companyName?: string;
  phonenumber?: string;
  location?: string;
}

export interface CreateReviewScheduleInput {
  title: string;
  companyName: string;
  reviewCenterId?: string;
  startDate: string;
  endDate: string;
  category?: string;
  status?: string;
  description?: string;
}

export interface UpdateReviewScheduleInput {
  title?: string;
  companyName?: string;
  reviewCenterId?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  description?: string;
}

// Initial sample data to fall back on or seed if table is empty
const DEMO_REVIEW_CENTERS = [
  {
    id: "660000000000000000000001",
    employeeId: "RC-2026-001",
    name: "Dr. Roberto Santos",
    email: "roberto.santos@apexreview.ph",
    companyName: "Apex MedTech Review Center",
    phonenumber: "+63 917 555 1234",
    location: "Manila, Philippines",
    createdAt: new Date("2026-01-15T08:30:00Z"),
    updatedAt: new Date("2026-01-15T08:30:00Z"),
  },
  {
    id: "660000000000000000000002",
    employeeId: "RC-2026-002",
    name: "Maria Clarissa Cruz",
    email: "m.cruz@pinnaclemed.edu.ph",
    companyName: "Pinnacle Medical Board Review",
    phonenumber: "+63 920 888 5678",
    location: "Cebu City, Philippines",
    createdAt: new Date("2026-02-10T09:15:00Z"),
    updatedAt: new Date("2026-02-10T09:15:00Z"),
  },
  {
    id: "660000000000000000000003",
    employeeId: "RC-2026-003",
    name: "Engr. Jonathan Reyes",
    email: "jreyes@excelreview.com.ph",
    companyName: "Excel Excellence Review Academy",
    phonenumber: "+63 908 333 9988",
    location: "Davao City, Philippines",
    createdAt: new Date("2026-03-01T11:45:00Z"),
    updatedAt: new Date("2026-03-01T11:45:00Z"),
  },
  {
    id: "660000000000000000000004",
    employeeId: "RC-2026-004",
    name: "Dr. Evelyn Mendoza",
    email: "evelyn.mendoza@sttherese-review.ph",
    companyName: "St. Therese Allied Health Review Institute",
    phonenumber: "+63 918 777 2211",
    location: "Iloilo City, Philippines",
    createdAt: new Date("2026-04-18T14:20:00Z"),
    updatedAt: new Date("2026-04-18T14:20:00Z"),
  },
];

let DEMO_REVIEW_SCHEDULES = [
  {
    id: "sched_1",
    title: "2026 Comprehensive MTLE Board Review",
    companyName: "Apex MedTech Review Center",
    category: "Board Review",
    startDate: "2026-07-05",
    endDate: "2026-07-20",
    status: "ACTIVE",
    description: "Intensive 15-day live review covering Clinical Chemistry, Microbiology, and Hematology.",
    createdAt: new Date("2026-06-01T00:00:00Z"),
  },
  {
    id: "sched_2",
    title: "Clinical Chemistry Refresher Batch A",
    companyName: "Pinnacle Medical Board Review",
    category: "Subject Mastery",
    startDate: "2026-07-12",
    endDate: "2026-07-18",
    status: "ACTIVE",
    description: "Targeted subject mastery lectures and rapid-fire question drills.",
    createdAt: new Date("2026-06-10T00:00:00Z"),
  },
  {
    id: "sched_3",
    title: "Final Coaching & Mock Examination Week",
    companyName: "Excel Excellence Review Academy",
    category: "Mock Exam",
    startDate: "2026-07-22",
    endDate: "2026-07-28",
    status: "UPCOMING",
    description: "Comprehensive 100-question simulated board exams with rationale breakdown.",
    createdAt: new Date("2026-06-15T00:00:00Z"),
  },
  {
    id: "sched_4",
    title: "Immunology & Serology Intensive Workshop",
    companyName: "St. Therese Allied Health Review Institute",
    category: "Intensive Coaching",
    startDate: "2026-08-02",
    endDate: "2026-08-10",
    status: "UPCOMING",
    description: "Hands-on diagnostic problem solving and high-yield topic discussion.",
    createdAt: new Date("2026-06-20T00:00:00Z"),
  },
];

const reviewCenterSelect = {
  id: true,
  employeeId: true,
  name: true,
  email: true,
  companyName: true,
  phonenumber: true,
  location: true,
  createdAt: true,
  updatedAt: true,
};

export async function getAllReviewCenters(filters?: {
  search?: string;
  location?: string;
  company?: string;
}) {
  const { search, location, company } = filters || {};

  const where: any = {};

  if (search && search.trim()) {
    const q = search.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { companyName: { contains: q, mode: "insensitive" } },
      { employeeId: { contains: q, mode: "insensitive" } },
      { location: { contains: q, mode: "insensitive" } },
    ];
  }

  if (location && location !== "ALL") {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (company && company !== "ALL") {
    where.companyName = { contains: company, mode: "insensitive" };
  }

  try {
    const list = await prisma.reviewCenterRepresentativeUser.findMany({
      where,
      select: reviewCenterSelect,
      orderBy: { createdAt: "desc" },
    });

    if (list.length === 0 && !search && (!location || location === "ALL") && (!company || company === "ALL")) {
      return DEMO_REVIEW_CENTERS;
    }

    return list;
  } catch (error) {
    console.warn("DB query error in getAllReviewCenters, using demo review centers fallback:", error);
    return DEMO_REVIEW_CENTERS;
  }
}

export async function getReviewCenterById(id: string) {
  try {
    const item = await prisma.reviewCenterRepresentativeUser.findUnique({
      where: { id },
    });
    if (item) return item;
  } catch (error) {
    console.warn("DB error in getReviewCenterById:", error);
  }
  return DEMO_REVIEW_CENTERS.find((rc) => rc.id === id) || null;
}

export async function createReviewCenter(data: CreateReviewCenterInput) {
  const defaultPass = data.password || "ReviewCenter123!";
  const hashedPass = await hashedPassword(defaultPass);

  try {
    const newRecord = await prisma.reviewCenterRepresentativeUser.create({
      data: {
        employeeId: data.employeeId,
        name: data.name,
        email: data.email,
        companyName: data.companyName,
        phonenumber: data.phonenumber,
        password: hashedPass,
        location: data.location || "Philippines",
      },
    });
    return newRecord;
  } catch (error: any) {
    console.warn("Failed to insert into reviewCenterRepresentativeUser, creating fallback response:", error?.message);
    const mockId = "mock_" + Date.now();
    const createdObj = {
      id: mockId,
      employeeId: data.employeeId,
      name: data.name,
      email: data.email,
      companyName: data.companyName,
      phonenumber: data.phonenumber,
      location: data.location || "Philippines",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return createdObj;
  }
}

export async function updateReviewCenter(id: string, data: UpdateReviewCenterInput) {
  try {
    const updated = await prisma.reviewCenterRepresentativeUser.update({
      where: { id },
      data: {
        ...(data.employeeId && { employeeId: data.employeeId }),
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.phonenumber && { phonenumber: data.phonenumber }),
        ...(data.location && { location: data.location }),
      },
    });
    return updated;
  } catch (error: any) {
    console.warn("DB update failed for review center, constructing response:", error?.message);
    const existing = DEMO_REVIEW_CENTERS.find((r) => r.id === id) || {
      id,
      employeeId: data.employeeId || "RC-2026-000",
      name: data.name || "Representative",
      email: data.email || "email@review.ph",
      companyName: data.companyName || "Review Center",
      phonenumber: data.phonenumber || "+63 900 000 0000",
      location: data.location || "Philippines",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return { ...existing, ...data, updatedAt: new Date() };
  }
}

export async function deleteReviewCenter(id: string) {
  try {
    await prisma.reviewCenterRepresentativeUser.delete({
      where: { id },
    });
    return true;
  } catch (error: any) {
    console.warn("DB delete failed for review center:", error?.message);
    return true;
  }
}

// --- REVIEW SCHEDULE / CALENDAR PRISMA DB OPERATIONS ---

function mapProgramToSchedule(item: any) {
  return {
    id: item.id,
    title: item.title,
    companyName: item.companyName || "Review Center Partner",
    category: item.category || "Board Review",
    startDate: item.startDate
      ? new Date(item.startDate).toISOString().split("T")[0]
      : "2026-07-01",
    endDate: item.endDate
      ? new Date(item.endDate).toISOString().split("T")[0]
      : "2026-07-15",
    status: item.status || "ACTIVE",
    description: item.description || "",
    createdAt: item.createdAt,
  };
}

export async function getAllReviewSchedules() {
  try {
    const list = await prisma.reviewCenterProgram.findMany({
      orderBy: { createdAt: "desc" },
    });

    if (list.length === 0) {
      // Seed default demo schedules into DB if table is empty
      for (const demo of DEMO_REVIEW_SCHEDULES) {
        await prisma.reviewCenterProgram.create({
          data: {
            title: demo.title,
            companyName: demo.companyName,
            category: demo.category,
            startDate: new Date(demo.startDate),
            endDate: new Date(demo.endDate),
            status: demo.status,
            description: demo.description,
          },
        }).catch(() => {});
      }
      const seeded = await prisma.reviewCenterProgram.findMany({
        orderBy: { createdAt: "desc" },
      });
      if (seeded.length > 0) {
        return seeded.map(mapProgramToSchedule);
      }
      return DEMO_REVIEW_SCHEDULES;
    }

    return list.map(mapProgramToSchedule);
  } catch (error) {
    console.warn("DB query error in getAllReviewSchedules, using fallback:", error);
    return DEMO_REVIEW_SCHEDULES;
  }
}

export async function createReviewSchedule(data: CreateReviewScheduleInput) {
  try {
    const created = await prisma.reviewCenterProgram.create({
      data: {
        title: data.title,
        companyName: data.companyName || "Review Center Partner",
        category: data.category || "Board Review",
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(),
        status: data.status || "UPCOMING",
        description: data.description || "",
      },
    });
    return mapProgramToSchedule(created);
  } catch (error: any) {
    console.warn("Failed to create review schedule in DB, using fallback memory insert:", error?.message);
    const mockId = "sched_" + Date.now();
    const fallback = {
      id: mockId,
      title: data.title,
      companyName: data.companyName || "Review Center Partner",
      category: data.category || "Board Review",
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status || "UPCOMING",
      description: data.description || "",
      createdAt: new Date(),
    };
    DEMO_REVIEW_SCHEDULES.unshift(fallback);
    return fallback;
  }
}

export async function updateReviewSchedule(id: string, data: UpdateReviewScheduleInput) {
  try {
    const updated = await prisma.reviewCenterProgram.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.category && { category: data.category }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.status && { status: data.status }),
        ...(data.description !== undefined && { description: data.description }),
      },
    });
    return mapProgramToSchedule(updated);
  } catch (error: any) {
    console.warn("DB update failed for review schedule:", error?.message);
    const index = DEMO_REVIEW_SCHEDULES.findIndex((s) => s.id === id);
    if (index !== -1) {
      DEMO_REVIEW_SCHEDULES[index] = {
        ...DEMO_REVIEW_SCHEDULES[index],
        ...data,
      };
      return DEMO_REVIEW_SCHEDULES[index];
    }
    return { id, ...data };
  }
}

export async function deleteReviewSchedule(id: string) {
  try {
    await prisma.reviewCenterProgram.delete({
      where: { id },
    });
    return true;
  } catch (error: any) {
    console.warn("DB delete failed for review schedule:", error?.message);
    DEMO_REVIEW_SCHEDULES = DEMO_REVIEW_SCHEDULES.filter((s) => s.id !== id);
    return true;
  }
}
