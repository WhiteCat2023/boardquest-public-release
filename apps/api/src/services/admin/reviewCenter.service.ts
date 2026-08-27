import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";

export interface CreateReviewCenterInput {
  employeeId: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  companyName: string;
  phonenumber: string;
  password?: string;
  location?: string;
}

export interface UpdateReviewCenterInput {
  employeeId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  companyName?: string;
  phonenumber?: string;
  location?: string;
}

const reviewCenterSelect = {
  id: true,
  employeeId: true,
  name: true,
  firstName: true,
  lastName: true,
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

  return await prisma.reviewCenterRepresentativeUser.findMany({
    where,
    select: reviewCenterSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewCenterById(id: string) {
  return await prisma.reviewCenterRepresentativeUser.findUnique({
    where: { id },
  });
}

export async function createReviewCenter(data: CreateReviewCenterInput) {
  const defaultPass = data.password || "ReviewCenter123!";
  const hashedPass = await hashedPassword(defaultPass);

  let firstName = data.firstName?.trim() || "";
  let lastName = data.lastName?.trim() || "";
  let name = data.name?.trim() || "";

  if (!name && (firstName || lastName)) {
    name = [firstName, lastName].filter(Boolean).join(" ").trim();
  } else if (name && !firstName && !lastName) {
    const parts = name.split(" ");
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  } else if (firstName && lastName && !name) {
    name = `${firstName} ${lastName}`.trim();
  }

  return await prisma.reviewCenterRepresentativeUser.create({
    data: {
      employeeId: data.employeeId,
      name: name || "Representative",
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      email: data.email,
      companyName: data.companyName,
      phonenumber: data.phonenumber,
      password: hashedPass,
      location: data.location || "Philippines",
    },
  });
}

export async function updateReviewCenter(
  id: string,
  data: UpdateReviewCenterInput,
) {
  return await prisma.reviewCenterRepresentativeUser.update({
    where: { id },
    data: {
      ...(data.employeeId && { employeeId: data.employeeId }),
      ...(data.name && { name: data.name }),
      ...(data.firstName && { firstName: data.firstName }),
      ...(data.lastName && { lastName: data.lastName }),
      ...(data.email && { email: data.email }),
      ...(data.companyName && { companyName: data.companyName }),
      ...(data.phonenumber && { phonenumber: data.phonenumber }),
      ...(data.location && { location: data.location }),
    },
  });
}

export async function deleteReviewCenter(id: string) {
  await prisma.reviewCenterRepresentativeUser.delete({
    where: { id },
  });
  return true;
}
