import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
import { createNotification } from "../admin/notification.service";
function mapToCandidate(item, userMap) {
    const email = item.email || "";
    const studentInfo = email && userMap ? userMap.get(email.toLowerCase()) : null;
    return {
        id: item.id,
        name: item.name,
        email: email,
        schoolId: item.schoolId || "",
        schoolYear: item.schoolYear || "2026-2027",
        batch: item.batch || item.schoolYear || "Batch 1",
        status: item.status || "ENROLLED",
        companyName: item.companyName,
        reviewCenterId: item.reviewCenterId || null,
        studentId: item.studentId || studentInfo?.id || null,
        studentDetails: studentInfo
            ? {
                level: studentInfo.level || 1,
                xp: studentInfo.xp || 0,
                streak: studentInfo.streak || 0,
                verified: studentInfo.verified || false,
            }
            : null,
        enrolledAt: item.enrolledAt || item.createdAt,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
    };
}
const dbSchoolYear = prisma.reviewCenterSchoolYear;
export async function getReviewCenterSchoolYears(companyName, reviewCenterId) {
    const whereConditions = [];
    if (reviewCenterId) {
        whereConditions.push({ reviewCenterId });
    }
    if (companyName && companyName.trim()) {
        whereConditions.push({
            companyName: { equals: companyName.trim(), mode: "insensitive" },
        });
    }
    if (whereConditions.length === 0) {
        return [];
    }
    const [dbSchoolYears, candidateSchoolYears, assessmentSchoolYears] = await Promise.all([
        dbSchoolYear
            ? dbSchoolYear.findMany({
                where: { OR: whereConditions },
                orderBy: { createdAt: "desc" },
            })
            : [],
        prisma.reviewCenterCandidate.findMany({
            where: { OR: whereConditions },
            select: { schoolYear: true },
        }),
        prisma.reviewCenterAssessment.findMany({
            where: { OR: whereConditions },
            select: { schoolYear: true },
        }),
    ]);
    const existingYearsSet = new Set();
    const results = [];
    for (const sy of dbSchoolYears) {
        const name = sy.schoolYear?.trim();
        if (name && !existingYearsSet.has(name)) {
            existingYearsSet.add(name);
            results.push({
                id: sy.id,
                schoolYear: name,
                isCurrent: sy.isCurrent,
                createdAt: sy.createdAt,
            });
        }
    }
    for (const c of candidateSchoolYears) {
        const syName = c.schoolYear?.trim();
        if (syName && !existingYearsSet.has(syName)) {
            existingYearsSet.add(syName);
            results.push({
                id: syName,
                schoolYear: syName,
                isCurrent: false,
                createdAt: new Date(),
            });
        }
    }
    for (const a of (assessmentSchoolYears || [])) {
        const syName = a.schoolYear?.trim();
        if (syName && !existingYearsSet.has(syName)) {
            existingYearsSet.add(syName);
            results.push({
                id: syName,
                schoolYear: syName,
                isCurrent: false,
                createdAt: new Date(),
            });
        }
    }
    return results.sort((a, b) => b.schoolYear.localeCompare(a.schoolYear));
}
export function normalizeSchoolYearString(sy) {
    const clean = sy.trim().replace(/^s\.?y\.?\s*/i, "");
    const digits = clean.replace(/\D/g, "");
    if (digits.length === 4) {
        const start = parseInt(digits, 10);
        if (!isNaN(start) && start >= 1900 && start <= 2100) {
            return `${start}-${start + 1}`;
        }
    }
    if (digits.length === 8) {
        return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    }
    return clean;
}
export async function createReviewCenterSchoolYear(companyName, schoolYear, reviewCenterId, isCurrent) {
    const cleanSY = normalizeSchoolYearString(schoolYear);
    if (!cleanSY) {
        throw new ApiError(400, "School Year is required.");
    }
    if (!/^\d{4}-\d{4}$/.test(cleanSY)) {
        throw new ApiError(400, "Invalid School Year format. Please use YYYY-YYYY format (e.g. 2026-2027).");
    }
    let finalReviewCenterId = reviewCenterId;
    if (!finalReviewCenterId && companyName) {
        const rc = await prisma.reviewCenter.findFirst({
            where: { name: { equals: companyName.trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (rc) {
            finalReviewCenterId = rc.id;
        }
    }
    const whereConditions = [];
    if (finalReviewCenterId) {
        whereConditions.push({ reviewCenterId: finalReviewCenterId });
    }
    if (companyName && companyName.trim()) {
        whereConditions.push({
            companyName: { equals: companyName.trim(), mode: "insensitive" },
        });
    }
    if (dbSchoolYear) {
        if (isCurrent && whereConditions.length > 0) {
            await dbSchoolYear.updateMany({
                where: { OR: whereConditions },
                data: { isCurrent: false },
            });
        }
        const existing = await dbSchoolYear.findFirst({
            where: {
                schoolYear: { equals: cleanSY, mode: "insensitive" },
                companyName: { equals: companyName.trim(), mode: "insensitive" },
            },
        });
        if (existing) {
            if (isCurrent) {
                await dbSchoolYear.update({
                    where: { id: existing.id },
                    data: { isCurrent: true },
                });
            }
            return {
                id: existing.id,
                schoolYear: existing.schoolYear,
                isCurrent: Boolean(isCurrent ?? existing.isCurrent),
                createdAt: existing.createdAt,
            };
        }
        const created = await dbSchoolYear.create({
            data: {
                schoolYear: cleanSY,
                companyName: companyName.trim(),
                reviewCenterId: finalReviewCenterId || null,
                isCurrent: Boolean(isCurrent),
                status: "ACTIVE",
            },
        });
        return {
            id: created.id,
            schoolYear: created.schoolYear,
            isCurrent: created.isCurrent,
            createdAt: created.createdAt,
        };
    }
    return {
        id: cleanSY,
        schoolYear: cleanSY,
        isCurrent: Boolean(isCurrent),
        createdAt: new Date(),
    };
}
export async function setCurrentReviewCenterSchoolYear(schoolYear, companyName, reviewCenterId) {
    const cleanSY = normalizeSchoolYearString(schoolYear) || schoolYear.trim();
    let finalReviewCenterId = reviewCenterId;
    if (!finalReviewCenterId && companyName) {
        const rc = await prisma.reviewCenter.findFirst({
            where: { name: { equals: companyName.trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (rc) {
            finalReviewCenterId = rc.id;
        }
    }
    const whereConditions = [];
    if (finalReviewCenterId) {
        whereConditions.push({ reviewCenterId: finalReviewCenterId });
    }
    if (companyName && companyName.trim()) {
        whereConditions.push({
            companyName: { equals: companyName.trim(), mode: "insensitive" },
        });
    }
    if (whereConditions.length === 0) {
        throw new ApiError(400, "Review center identification is required.");
    }
    if (dbSchoolYear) {
        // 1. Unset isCurrent for all school years belonging to this review center
        await dbSchoolYear.updateMany({
            where: { OR: whereConditions },
            data: { isCurrent: false },
        });
        // 2. Set isCurrent on target school year (or create record if it only existed in candidates)
        const existing = await dbSchoolYear.findFirst({
            where: {
                schoolYear: { equals: cleanSY, mode: "insensitive" },
                OR: whereConditions,
            },
        });
        if (existing) {
            await dbSchoolYear.update({
                where: { id: existing.id },
                data: { isCurrent: true },
            });
        }
        else {
            await dbSchoolYear.create({
                data: {
                    schoolYear: cleanSY,
                    companyName: companyName ? companyName.trim() : "",
                    reviewCenterId: finalReviewCenterId || null,
                    isCurrent: true,
                    status: "ACTIVE",
                },
            });
        }
        createNotification({
            recipientRole: "REVIEW_CENTER_REPRESENTATIVE",
            recipientId: finalReviewCenterId || undefined,
            title: "Active School Year Updated",
            message: `S.Y. ${cleanSY} is now set as the active academic cohort.`,
            type: "INFO",
            link: `/candidates/${encodeURIComponent(cleanSY)}`,
            metadata: {
                reviewCenterId: finalReviewCenterId,
                companyName,
                schoolYear: cleanSY,
            },
        }).catch((err) => console.warn("School year notification error:", err?.message));
    }
    return { schoolYear: cleanSY, isCurrent: true };
}
export async function updateReviewCenterSchoolYear(oldSchoolYear, newSchoolYear, companyName, reviewCenterId, isCurrent) {
    const cleanOld = oldSchoolYear.trim().replace(/^s\.?y\.?\s*/i, "");
    const cleanNew = normalizeSchoolYearString(newSchoolYear);
    if (!cleanNew) {
        throw new ApiError(400, "New school year is required.");
    }
    if (!/^\d{4}-\d{4}$/.test(cleanNew)) {
        throw new ApiError(400, "Invalid school year format. Please use YYYY-YYYY format (e.g. 2026-2027).");
    }
    let finalReviewCenterId = reviewCenterId;
    if (!finalReviewCenterId && companyName) {
        const rc = await prisma.reviewCenter.findFirst({
            where: { name: { equals: companyName.trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (rc) {
            finalReviewCenterId = rc.id;
        }
    }
    const whereConditions = [];
    if (finalReviewCenterId) {
        whereConditions.push({ reviewCenterId: finalReviewCenterId });
    }
    if (companyName && companyName.trim()) {
        whereConditions.push({
            companyName: { equals: companyName.trim(), mode: "insensitive" },
        });
    }
    if (whereConditions.length === 0) {
        throw new ApiError(400, "Review center identification is required.");
    }
    // If old and new are identical, update isCurrent if provided and return early
    if (cleanOld.toLowerCase() === cleanNew.toLowerCase()) {
        if (isCurrent !== undefined && dbSchoolYear) {
            if (isCurrent && whereConditions.length > 0) {
                await dbSchoolYear.updateMany({
                    where: { OR: whereConditions },
                    data: { isCurrent: false },
                });
            }
            await dbSchoolYear.updateMany({
                where: {
                    schoolYear: { equals: cleanNew, mode: "insensitive" },
                    OR: whereConditions,
                },
                data: { isCurrent },
            });
        }
        return { schoolYear: cleanNew, isCurrent };
    }
    // Check if newSchoolYear already exists
    if (dbSchoolYear) {
        const existing = await dbSchoolYear.findFirst({
            where: {
                schoolYear: { equals: cleanNew, mode: "insensitive" },
                OR: whereConditions,
            },
        });
        if (existing) {
            throw new ApiError(409, `School Year "${cleanNew}" already exists in database.`);
        }
    }
    // 1. Update ReviewCenterSchoolYear
    if (dbSchoolYear) {
        if (isCurrent && whereConditions.length > 0) {
            await dbSchoolYear.updateMany({
                where: { OR: whereConditions },
                data: { isCurrent: false },
            });
        }
        const existingRecord = await dbSchoolYear.findFirst({
            where: {
                schoolYear: { equals: cleanOld, mode: "insensitive" },
                OR: whereConditions,
            },
        });
        if (existingRecord) {
            await dbSchoolYear.update({
                where: { id: existingRecord.id },
                data: {
                    schoolYear: cleanNew,
                    ...(isCurrent !== undefined ? { isCurrent } : {}),
                },
            });
        }
        else {
            await dbSchoolYear.create({
                data: {
                    schoolYear: cleanNew,
                    companyName: companyName ? companyName.trim() : "",
                    reviewCenterId: finalReviewCenterId || null,
                    isCurrent: Boolean(isCurrent),
                    status: "ACTIVE",
                },
            });
        }
    }
    // 2. Cascade update candidates
    await prisma.reviewCenterCandidate.updateMany({
        where: {
            schoolYear: { equals: cleanOld, mode: "insensitive" },
            OR: whereConditions,
        },
        data: {
            schoolYear: cleanNew,
        },
    });
    // 3. Cascade update assessments
    await prisma.reviewCenterAssessment.updateMany({
        where: {
            schoolYear: { equals: cleanOld, mode: "insensitive" },
            OR: whereConditions,
        },
        data: {
            schoolYear: cleanNew,
        },
    });
    return { schoolYear: cleanNew };
}
export async function deleteReviewCenterSchoolYear(schoolYear, companyName, reviewCenterId) {
    const cleanSY = schoolYear.trim().replace(/^s\.?y\.?\s*/i, "");
    const whereConditions = [];
    if (reviewCenterId) {
        whereConditions.push({ reviewCenterId });
    }
    if (companyName && companyName.trim()) {
        whereConditions.push({
            companyName: { equals: companyName.trim(), mode: "insensitive" },
        });
    }
    if (whereConditions.length === 0) {
        throw new ApiError(400, "Review center identification is required.");
    }
    // 1. Delete from ReviewCenterSchoolYear
    if (dbSchoolYear) {
        await dbSchoolYear.deleteMany({
            where: {
                schoolYear: { equals: cleanSY, mode: "insensitive" },
                OR: whereConditions,
            },
        });
    }
    // 2. Delete candidates and their associated scores
    const candidatesToDelete = await prisma.reviewCenterCandidate.findMany({
        where: {
            schoolYear: { equals: cleanSY, mode: "insensitive" },
            OR: whereConditions,
        },
        select: { id: true },
    });
    if (candidatesToDelete.length > 0) {
        const candidateIds = candidatesToDelete.map((c) => c.id);
        await prisma.reviewCenterScore.deleteMany({
            where: { candidateId: { in: candidateIds } },
        });
        await prisma.reviewCenterCandidate.deleteMany({
            where: { id: { in: candidateIds } },
        });
    }
    // 3. Delete assessments and their associated scores
    const assessmentsToDelete = await prisma.reviewCenterAssessment.findMany({
        where: {
            schoolYear: { equals: cleanSY, mode: "insensitive" },
            OR: whereConditions,
        },
        select: { id: true },
    });
    if (assessmentsToDelete.length > 0) {
        const assessmentIds = assessmentsToDelete.map((a) => a.id);
        await prisma.reviewCenterScore.deleteMany({
            where: { assessmentId: { in: assessmentIds } },
        });
        await prisma.reviewCenterAssessment.deleteMany({
            where: { id: { in: assessmentIds } },
        });
    }
    return true;
}
export async function getReviewCenterCandidates(companyName, reviewCenterId, filters = {}) {
    const whereConditions = [];
    if (reviewCenterId) {
        whereConditions.push({ reviewCenterId });
    }
    if (companyName && companyName.trim()) {
        whereConditions.push({
            companyName: { equals: companyName.trim(), mode: "insensitive" },
        });
    }
    if (whereConditions.length === 0) {
        return {
            candidates: [],
            schoolYears: [],
            batches: [],
            total: 0,
        };
    }
    const baseWhere = {
        AND: [{ OR: whereConditions }],
    };
    if (filters.status && filters.status !== "ALL") {
        baseWhere.status = filters.status;
    }
    const [rawCandidates, allSYRecords] = await Promise.all([
        prisma.reviewCenterCandidate.findMany({
            where: baseWhere,
            orderBy: { createdAt: "desc" },
        }),
        getReviewCenterSchoolYears(companyName, reviewCenterId),
    ]);
    // Extract all emails to batch query User table for level/xp
    const allEmails = rawCandidates.map((c) => c.email.toLowerCase()).filter(Boolean);
    let userMap = new Map();
    if (allEmails.length > 0) {
        const users = await prisma.user.findMany({
            where: { email: { in: allEmails } },
            select: {
                id: true,
                email: true,
                name: true,
                level: true,
                xp: true,
                streak: true,
                verified: true,
            },
        });
        users.forEach((u) => userMap.set(u.email.toLowerCase(), u));
    }
    let candidates = rawCandidates.map((c) => mapToCandidate(c, userMap));
    // In-memory filter for schoolYear, batch, search
    if (filters.schoolYear && filters.schoolYear !== "ALL") {
        candidates = candidates.filter((c) => c.schoolYear.toLowerCase() === filters.schoolYear?.toLowerCase());
    }
    if (filters.search && filters.search.trim()) {
        const term = filters.search.trim().toLowerCase();
        candidates = candidates.filter((c) => c.name.toLowerCase().includes(term) ||
            c.email.toLowerCase().includes(term) ||
            (c.schoolId && c.schoolId.toLowerCase().includes(term)));
    }
    const schoolYears = allSYRecords.map((s) => s.schoolYear);
    return {
        candidates,
        schoolYears,
        batches: [],
        total: candidates.length,
    };
}
export async function enrollCandidate(data) {
    if (!data.name?.trim() || !data.email?.trim()) {
        throw new ApiError(400, "Student name and valid email are required.");
    }
    if (!data.schoolYear?.trim()) {
        throw new ApiError(400, "School Year is required.");
    }
    let finalReviewCenterId = data.reviewCenterId;
    if (!finalReviewCenterId && data.companyName) {
        const rc = await prisma.reviewCenter.findFirst({
            where: { name: { equals: data.companyName.trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (rc) {
            finalReviewCenterId = rc.id;
        }
    }
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanSY = normalizeSchoolYearString(data.schoolYear);
    // Ensure School Year is saved in ReviewCenterSchoolYear
    await createReviewCenterSchoolYear(data.companyName, cleanSY, finalReviewCenterId);
    // Check if candidate already enrolled in this school year in ReviewCenterCandidate
    const existingCandidate = await prisma.reviewCenterCandidate.findFirst({
        where: {
            email: { equals: cleanEmail, mode: "insensitive" },
            schoolYear: { equals: cleanSY, mode: "insensitive" },
            companyName: { equals: data.companyName.trim(), mode: "insensitive" },
        },
    });
    if (existingCandidate) {
        throw new ApiError(400, `Student with email "${data.email}" is already enrolled in School Year ${data.schoolYear}.`);
    }
    // Auto-link registered user
    let studentId = null;
    const registeredUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
        select: { id: true },
    });
    if (registeredUser) {
        studentId = registeredUser.id;
    }
    const created = await prisma.reviewCenterCandidate.create({
        data: {
            name: data.name.trim(),
            email: cleanEmail,
            schoolId: data.schoolId?.trim() || null,
            schoolYear: cleanSY,
            batch: data.batch?.trim() || cleanSY,
            status: data.status || "ENROLLED",
            companyName: data.companyName.trim(),
            reviewCenterId: finalReviewCenterId || null,
            studentId,
        },
    });
    createNotification({
        recipientRole: "REVIEW_CENTER_REPRESENTATIVE",
        recipientId: finalReviewCenterId || undefined,
        title: "Candidate Enrolled",
        message: `${data.name.trim()} was enrolled for S.Y. ${cleanSY}.`,
        type: "SUCCESS",
        link: `/candidates/${encodeURIComponent(cleanSY)}`,
        metadata: {
            reviewCenterId: finalReviewCenterId,
            companyName: data.companyName,
            candidateEmail: cleanEmail,
            schoolYear: cleanSY,
        },
    }).catch((err) => console.warn("Candidate notification error:", err?.message));
    return mapToCandidate(created);
}
export async function bulkEnrollCandidates(data) {
    if (!data.schoolYear?.trim()) {
        throw new ApiError(400, "School Year is required.");
    }
    if (!Array.isArray(data.students) || data.students.length === 0) {
        throw new ApiError(400, "Please provide at least one student to enroll.");
    }
    let finalReviewCenterId = data.reviewCenterId;
    if (!finalReviewCenterId && data.companyName) {
        const rc = await prisma.reviewCenter.findFirst({
            where: { name: { equals: data.companyName.trim(), mode: "insensitive" } },
            select: { id: true },
        });
        if (rc) {
            finalReviewCenterId = rc.id;
        }
    }
    const cleanSY = normalizeSchoolYearString(data.schoolYear);
    // Ensure School Year exists in ReviewCenterSchoolYear
    await createReviewCenterSchoolYear(data.companyName, cleanSY, finalReviewCenterId);
    const existingCandidates = await prisma.reviewCenterCandidate.findMany({
        where: {
            schoolYear: { equals: cleanSY, mode: "insensitive" },
            companyName: { equals: data.companyName.trim(), mode: "insensitive" },
        },
        select: { email: true },
    });
    const existingEmailsSet = new Set(existingCandidates.map((c) => c.email.toLowerCase()));
    let enrolledCount = 0;
    let skippedCount = 0;
    const createdList = [];
    for (const item of data.students) {
        if (!item.name?.trim() || !item.email?.trim() || !item.email.includes("@")) {
            skippedCount++;
            continue;
        }
        const itemEmail = item.email.trim().toLowerCase();
        if (existingEmailsSet.has(itemEmail)) {
            skippedCount++;
            continue;
        }
        let studentId = null;
        const registeredUser = await prisma.user.findUnique({
            where: { email: itemEmail },
            select: { id: true },
        });
        if (registeredUser) {
            studentId = registeredUser.id;
        }
        const created = await prisma.reviewCenterCandidate.create({
            data: {
                name: item.name.trim(),
                email: itemEmail,
                schoolId: item.schoolId?.trim() || null,
                schoolYear: cleanSY,
                batch: item.batch?.trim() || data.batch?.trim() || cleanSY,
                status: "ENROLLED",
                companyName: data.companyName.trim(),
                reviewCenterId: finalReviewCenterId || null,
                studentId,
            },
        });
        existingEmailsSet.add(itemEmail);
        createdList.push(mapToCandidate(created));
        enrolledCount++;
    }
    if (enrolledCount > 0) {
        createNotification({
            recipientRole: "REVIEW_CENTER_REPRESENTATIVE",
            recipientId: finalReviewCenterId || undefined,
            title: "Candidates Imported",
            message: `Successfully enrolled ${enrolledCount} candidate(s) for S.Y. ${cleanSY}.`,
            type: "SUCCESS",
            link: `/candidates/${encodeURIComponent(cleanSY)}`,
            metadata: {
                reviewCenterId: finalReviewCenterId,
                companyName: data.companyName,
                schoolYear: cleanSY,
                count: enrolledCount,
            },
        }).catch((err) => console.warn("Bulk candidates notification error:", err?.message));
    }
    return {
        enrolledCount,
        skippedCount,
        totalSubmitted: data.students.length,
        enrolled: createdList,
    };
}
export async function updateCandidate(id, data, companyName, reviewCenterId) {
    const existing = await prisma.reviewCenterCandidate.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError(404, "Student record not found");
    }
    const isOwner = (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
        (companyName &&
            existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());
    if (!isOwner) {
        throw new ApiError(403, "Access denied: You can only edit students enrolled in your review center.");
    }
    const cleanSY = data.schoolYear ? normalizeSchoolYearString(data.schoolYear) : undefined;
    if (cleanSY && (companyName || existing.companyName)) {
        await createReviewCenterSchoolYear(companyName || existing.companyName, cleanSY, reviewCenterId || existing.reviewCenterId || undefined);
    }
    const updated = await prisma.reviewCenterCandidate.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name.trim() }),
            ...(data.email && { email: data.email.trim().toLowerCase() }),
            ...(data.schoolId !== undefined && { schoolId: data.schoolId.trim() || null }),
            ...(cleanSY && { schoolYear: cleanSY }),
            ...(data.batch && { batch: data.batch.trim() }),
            ...(data.status && { status: data.status }),
        },
    });
    return mapToCandidate(updated);
}
export async function deleteCandidate(id, companyName, reviewCenterId) {
    const existing = await prisma.reviewCenterCandidate.findUnique({
        where: { id },
    });
    if (!existing) {
        throw new ApiError(404, "Student record not found");
    }
    const isOwner = (reviewCenterId && existing.reviewCenterId === reviewCenterId) ||
        (companyName &&
            existing.companyName?.trim().toLowerCase() === companyName.trim().toLowerCase());
    if (!isOwner) {
        throw new ApiError(403, "Access denied: You can only remove students enrolled in your review center.");
    }
    await prisma.reviewCenterCandidate.delete({
        where: { id },
    });
    return true;
}
