import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
function mapToSchedule(item) {
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
        reviewCenterId: item.reviewCenterId || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    };
}
/**
 * Get review schedules scoped STRICTLY to the current review center representative
 */
export async function getReviewCenterSchedules(companyName, reviewCenterId) {
    const whereConditions = [];
    if (reviewCenterId) {
        whereConditions.push({ reviewCenterId });
    }
    if (companyName && companyName.trim()) {
        whereConditions.push({
            companyName: { equals: companyName.trim(), mode: "insensitive" },
        });
    }
    // If no review center identification exists, strictly return empty list
    if (whereConditions.length === 0) {
        return [];
    }
    const list = await prisma.reviewCenterProgram.findMany({
        where: {
            OR: whereConditions,
        },
        orderBy: { startDate: "asc" },
    });
    return list
        .map(mapToSchedule);
}
/**
 * Create a review schedule strictly tied to the current representative's review center
 */
export async function createReviewCenterSchedule(data) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(data.startDate);
    start.setHours(0, 0, 0, 0);
    if (start < today) {
        throw new ApiError(400, "Review schedule start date cannot be set in the past.");
    }
    const end = new Date(data.endDate);
    end.setHours(0, 0, 0, 0);
    if (end < start) {
        throw new ApiError(400, "End date cannot be earlier than start date.");
    }
    let finalReviewCenterId = data.reviewCenterId;
    // Auto-link reviewCenterId if company name matches an existing ReviewCenter
    if (!finalReviewCenterId && data.companyName) {
        const rc = await prisma.reviewCenter.findFirst({
            where: { name: { equals: data.companyName.trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (rc) {
            finalReviewCenterId = rc.id;
        }
    }
    const created = await prisma.reviewCenterProgram.create({
        data: {
            title: data.title,
            companyName: data.companyName || "Review Center Partner",
            reviewCenterId: finalReviewCenterId || null,
            category: data.category || "Board Review",
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            status: "UPCOMING",
            description: data.description || "",
        },
    });
    return mapToSchedule(created);
}
/**
 * Update a review schedule with strict ownership verification
 */
export async function updateReviewCenterSchedule(id, data, companyName, reviewCenterId) {
    const existing = await prisma.reviewCenterProgram.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError(404, "Review schedule not found");
    }
    // Strictly enforce ownership check
    const isOwner = (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
        (companyName &&
            existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());
    if (!isOwner) {
        throw new ApiError(403, "Access denied: You can only modify schedules belonging to your review center.");
    }
    const updated = await prisma.reviewCenterProgram.update({
        where: { id },
        data: {
            ...(data.title && { title: data.title }),
            ...(data.category && { category: data.category }),
            ...(data.startDate && { startDate: new Date(data.startDate) }),
            ...(data.endDate && { endDate: new Date(data.endDate) }),
            ...(data.status && { status: data.status }),
            ...(data.description !== undefined && { description: data.description }),
        },
    });
    return mapToSchedule(updated);
}
/**
 * Delete a review schedule with strict ownership verification
 */
export async function deleteReviewCenterSchedule(id, companyName, reviewCenterId) {
    const existing = await prisma.reviewCenterProgram.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError(404, "Review schedule not found");
    }
    // Strictly enforce ownership check
    const isOwner = (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
        (companyName &&
            existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());
    if (!isOwner) {
        throw new ApiError(403, "Access denied: You can only delete schedules belonging to your review center.");
    }
    await prisma.reviewCenterProgram.delete({
        where: { id },
    });
    return true;
}
