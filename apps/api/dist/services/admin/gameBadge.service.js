import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
export const ALLOWED_BADGE_CATEGORIES = [
    "QUEST",
    "STREAK",
    "BOSS",
    "SUBJECT",
    "EXAM",
    "PERFORMANCE",
    "SPEED",
    "MASTERY",
    "SPECIAL",
];
export class GameBadgeService {
    /**
     * Get all badges with dynamically computed student unlock counts
     */
    async getAllBadges(options) {
        const andConditions = [];
        if (options?.activeOnly) {
            andConditions.push({ isActive: true });
        }
        if (options?.status && options.status !== "ALL") {
            if (options.status === "active" || options.status === "true") {
                andConditions.push({ isActive: true });
            }
            else if (options.status === "inactive" || options.status === "false") {
                andConditions.push({ isActive: false });
            }
        }
        if (options?.category && options.category !== "ALL") {
            andConditions.push({ category: { equals: options.category, mode: "insensitive" } });
        }
        if (options?.badgeType && options.badgeType !== "ALL") {
            andConditions.push({
                OR: [
                    { tier: { equals: options.badgeType, mode: "insensitive" } },
                    { badgeId: { equals: options.badgeType, mode: "insensitive" } },
                ],
            });
        }
        if (options?.search && options.search.trim()) {
            const q = options.search.trim();
            andConditions.push({
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { title: { contains: q, mode: "insensitive" } },
                    { badgeId: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    { category: { contains: q, mode: "insensitive" } },
                ],
            });
        }
        const where = andConditions.length > 0 ? { AND: andConditions } : {};
        const [badges, userBadgeCounts] = await Promise.all([
            prisma.badge.findMany({
                where,
                include: {
                    _count: {
                        select: { userBadges: true },
                    },
                },
                orderBy: { createdAt: "asc" },
            }),
            prisma.userBadge.groupBy({
                by: ["badgeSlug"],
                _count: { _all: true },
            }).catch(() => []),
        ]);
        const slugCountMap = new Map();
        userBadgeCounts.forEach((ub) => {
            if (ub.badgeSlug) {
                slugCountMap.set(ub.badgeSlug.toLowerCase().trim(), ub._count?._all || 0);
            }
        });
        return badges.map((badge) => {
            const relCount = badge._count?.userBadges ?? 0;
            const slugCount = slugCountMap.get(badge.badgeId.toLowerCase().trim()) ?? 0;
            return {
                ...badge,
                unlockedCount: Math.max(relCount, slugCount),
            };
        });
    }
    /**
     * Get single badge by ID or badgeId slug
     */
    async getBadgeById(id) {
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        const badge = await prisma.badge.findFirst({
            where: isObjectId ? { OR: [{ id }, { badgeId: id }] } : { badgeId: id },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });
        if (!badge) {
            throw new ApiError(404, "Badge not found");
        }
        const slugCount = await prisma.userBadge.count({
            where: { badgeSlug: badge.badgeId },
        }).catch(() => 0);
        return {
            ...badge,
            unlockedCount: Math.max(badge._count?.userBadges ?? 0, slugCount),
        };
    }
    /**
     * Create new badge with full BoardQuesters slug compatibility & UserBadge auto-linking
     */
    async createBadge(data) {
        if (!data.name || !data.description || !data.unlockCondition) {
            throw new ApiError(400, "Name, description, and unlockCondition are required");
        }
        let badgeId;
        if (data.badgeId && data.badgeId.trim()) {
            badgeId = data.badgeId
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+|-+$/g, "");
        }
        else {
            const baseSlug = (data.title || data.name)
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+|-+$/g, "");
            const existingBase = await prisma.badge.findUnique({ where: { badgeId: baseSlug } });
            badgeId = existingBase ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
        }
        const existing = await prisma.badge.findUnique({
            where: { badgeId },
        });
        if (existing) {
            throw new ApiError(409, `A badge with badgeId '${badgeId}' already exists`);
        }
        const rawCategory = data.category ? String(data.category).toUpperCase().trim() : "QUEST";
        const category = ALLOWED_BADGE_CATEGORIES.includes(rawCategory)
            ? rawCategory
            : "QUEST";
        const newBadge = await prisma.badge.create({
            data: {
                badgeId,
                title: data.title || data.name,
                name: data.name,
                description: data.description,
                category,
                tier: data.tier || "STANDARD",
                icon: data.icon || "trophy",
                spriteUrl: data.spriteUrl || null,
                color: data.color || "#FFD700",
                unlockCondition: data.unlockCondition,
                xpReward: Number(data.xpReward) || 50,
                confidenceFactor: Number(data.confidenceFactor) || 1.0,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            },
        });
        // Auto-link any existing UserBadge records that were earned in game with this slug
        await prisma.userBadge.updateMany({
            where: { badgeSlug: newBadge.badgeId },
            data: { badgeId: newBadge.id },
        }).catch((err) => console.warn("[GameBadgeService] Auto-linking UserBadges warning:", err));
        return newBadge;
    }
    /**
     * Update existing badge with slug & UserBadge auto-sync
     */
    async updateBadge(id, data) {
        const existing = await this.getBadgeById(id);
        const updatePayload = {};
        if (data.badgeId !== undefined && data.badgeId.trim()) {
            const cleanSlug = data.badgeId
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9-]+/g, "-")
                .replace(/^-+|-+$/g, "");
            if (cleanSlug !== existing.badgeId) {
                const slugCollision = await prisma.badge.findUnique({
                    where: { badgeId: cleanSlug },
                });
                if (slugCollision && slugCollision.id !== existing.id) {
                    throw new ApiError(409, `A badge with badgeId '${cleanSlug}' already exists`);
                }
                updatePayload.badgeId = cleanSlug;
            }
        }
        if (data.category !== undefined) {
            const rawCategory = String(data.category).toUpperCase().trim();
            updatePayload.category = ALLOWED_BADGE_CATEGORIES.includes(rawCategory)
                ? rawCategory
                : rawCategory || "QUEST";
        }
        if (data.title !== undefined)
            updatePayload.title = data.title.trim();
        if (data.name !== undefined)
            updatePayload.name = data.name.trim();
        if (data.description !== undefined)
            updatePayload.description = data.description.trim();
        if (data.tier !== undefined)
            updatePayload.tier = data.tier;
        if (data.icon !== undefined)
            updatePayload.icon = data.icon;
        if (data.spriteUrl !== undefined)
            updatePayload.spriteUrl = data.spriteUrl || null;
        if (data.color !== undefined)
            updatePayload.color = data.color;
        if (data.unlockCondition !== undefined)
            updatePayload.unlockCondition = data.unlockCondition.trim();
        if (data.xpReward !== undefined)
            updatePayload.xpReward = Number(data.xpReward);
        if (data.confidenceFactor !== undefined)
            updatePayload.confidenceFactor = Number(data.confidenceFactor);
        if (data.isActive !== undefined)
            updatePayload.isActive = Boolean(data.isActive);
        const updated = await prisma.badge.update({
            where: { id: existing.id },
            data: updatePayload,
        });
        // If slug changed or relink needed, link matching UserBadges
        const targetSlug = updated.badgeId;
        await prisma.userBadge.updateMany({
            where: { badgeSlug: targetSlug },
            data: { badgeId: updated.id },
        }).catch((err) => console.warn("[GameBadgeService] Relinking UserBadges warning:", err));
        return updated;
    }
    /**
     * Toggle badge active status
     */
    async toggleBadgeActive(id) {
        const badge = await this.getBadgeById(id);
        return prisma.badge.update({
            where: { id: badge.id },
            data: {
                isActive: !badge.isActive,
            },
        });
    }
    /**
     * Delete badge and cleanly unlink UserBadges
     */
    async deleteBadge(id) {
        const badge = await this.getBadgeById(id);
        // Unlink UserBadges so user achievement records are safely preserved
        await prisma.userBadge.updateMany({
            where: { badgeId: badge.id },
            data: { badgeId: null },
        }).catch((err) => console.warn("[GameBadgeService] Unlinking UserBadges warning:", err));
        return prisma.badge.delete({
            where: { id: badge.id },
        });
    }
}
export const gameBadgeService = new GameBadgeService();
