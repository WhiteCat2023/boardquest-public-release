import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";
export const ALLOWED_BADGE_CATEGORIES = [
    "QUEST",
    "STREAK",
    "BOSS",
    "SUBJECT",
    "EXAM",
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
            andConditions.push({ badgeType: options.badgeType });
        }
        if (options?.search && options.search.trim()) {
            const q = options.search.trim();
            andConditions.push({
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                    { category: { contains: q, mode: "insensitive" } },
                ],
            });
        }
        const where = andConditions.length > 0 ? { AND: andConditions } : {};
        let badges = await prisma.badge.findMany({
            where,
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
            orderBy: { createdAt: "asc" },
        });
        return badges.map((badge) => ({
            ...badge,
            unlockedCount: badge._count?.userBadges ?? 0,
        }));
    }
    /**
     * Get single badge by ID
     */
    async getBadgeById(id) {
        const badge = await prisma.badge.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { userBadges: true },
                },
            },
        });
        if (!badge) {
            throw new ApiError(404, "Badge not found");
        }
        return {
            ...badge,
            unlockedCount: badge._count?.userBadges ?? 0,
        };
    }
    /**
     * Create new badge
     */
    async createBadge(data) {
        if (!data.name || !data.description || !data.unlockCondition) {
            throw new ApiError(400, "Name, description, and unlockCondition are required");
        }
        const badgeId = data.badgeId ||
            data.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "") + `-${Date.now().toString(36)}`;
        const existing = await prisma.badge.findUnique({
            where: { badgeId },
        });
        if (existing) {
            throw new ApiError(409, "A badge with this badgeId already exists");
        }
        const rawCategory = data.category ? String(data.category).toUpperCase() : "QUEST";
        if (!ALLOWED_BADGE_CATEGORIES.includes(rawCategory)) {
            throw new ApiError(400, `Invalid category '${data.category}'. Allowed categories are: ${ALLOWED_BADGE_CATEGORIES.join(", ")}`);
        }
        const category = rawCategory;
        return prisma.badge.create({
            data: {
                badgeId,
                title: data.title || data.name,
                name: data.name,
                description: data.description,
                category,
                icon: data.icon || "trophy",
                spriteUrl: data.spriteUrl || null,
                color: data.color || "#FFD700",
                unlockCondition: data.unlockCondition,
                xpReward: Number(data.xpReward) || 50,
                confidenceFactor: Number(data.confidenceFactor) || 1.0,
                isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
            },
        });
    }
    /**
     * Update existing badge
     */
    async updateBadge(id, data) {
        await this.getBadgeById(id);
        let category = undefined;
        if (data.category !== undefined) {
            const rawCategory = String(data.category).toUpperCase();
            if (!ALLOWED_BADGE_CATEGORIES.includes(rawCategory)) {
                throw new ApiError(400, `Invalid category '${data.category}'. Allowed categories are: ${ALLOWED_BADGE_CATEGORIES.join(", ")}`);
            }
            category = rawCategory;
        }
        return prisma.badge.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.name !== undefined && { name: data.name }),
                ...(data.description !== undefined && { description: data.description }),
                ...(category !== undefined && { category }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.spriteUrl !== undefined && { spriteUrl: data.spriteUrl || null }),
                ...(data.color !== undefined && { color: data.color }),
                ...(data.unlockCondition !== undefined && { unlockCondition: data.unlockCondition }),
                ...(data.xpReward !== undefined && { xpReward: Number(data.xpReward) }),
                ...(data.confidenceFactor !== undefined && { confidenceFactor: Number(data.confidenceFactor) }),
                ...(data.isActive !== undefined && { isActive: Boolean(data.isActive) }),
            },
        });
    }
    /**
     * Toggle badge active status
     */
    async toggleBadgeActive(id) {
        const badge = await this.getBadgeById(id);
        return prisma.badge.update({
            where: { id },
            data: {
                isActive: !badge.isActive,
            },
        });
    }
    /**
     * Delete badge
     */
    async deleteBadge(id) {
        await this.getBadgeById(id);
        return prisma.badge.delete({
            where: { id },
        });
    }
}
export const gameBadgeService = new GameBadgeService();
