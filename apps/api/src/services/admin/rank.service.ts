import prisma from "../prisma";
import { ApiError } from "../../utils/apiError";

export interface RankTierData {
  id: string;
  rankId: string;
  title: string;
  name: string;
  description: string;
  minLevel: number;
  maxLevel: number | null;
  minXp: number;
  icon: string;
  color: string;
  spriteUrl?: string | null;
  perks?: string[];
  isActive: boolean;
  studentCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRankInput {
  rankId?: string;
  title: string;
  name?: string;
  description?: string;
  minLevel: number;
  maxLevel?: number | null;
  minXp?: number;
  icon?: string;
  color?: string;
  spriteUrl?: string | null;
  perks?: string[];
  isActive?: boolean;
}

export interface UpdateRankInput extends Partial<CreateRankInput> {}

export class GameRankService {
  /**
   * Calculate BoardQuesters XP threshold for level
   * Formula: XP = (level - 1)^2 * 100
   */
  public calculateMinXp(level: number): number {
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * 100;
  }

  /**
   * Helper to resolve a rank by ObjectId or rankId slug
   */
  private async findRankByIdOrSlug(id: string) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
    return prisma.rankTier.findFirst({
      where: isObjectId ? { OR: [{ id }, { rankId: id }] } : { rankId: id },
    });
  }

  /**
   * Get all ranks from database with live student count aggregated from real DB users
   */
  async getAllRanks(options?: {
    search?: string;
    status?: string;
    activeOnly?: boolean;
  }): Promise<RankTierData[]> {
    const andConditions: any[] = [];

    if (options?.activeOnly) {
      andConditions.push({ isActive: true });
    }

    if (options?.status && options.status !== "ALL") {
      if (options.status.toLowerCase() === "active") {
        andConditions.push({ isActive: true });
      } else if (options.status.toLowerCase() === "inactive") {
        andConditions.push({ isActive: false });
      }
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { rankId: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

    const [ranks, students] = await Promise.all([
      prisma.rankTier.findMany({
        where,
        orderBy: { minLevel: "asc" },
      }),
      prisma.user.findMany({
        select: {
          id: true,
          level: true,
        },
      }),
    ]);

    return ranks.map((rank) => {
      const count = students.filter((s) => {
        const studentLevel = s.level ?? 1;
        if (rank.maxLevel === null || rank.maxLevel === undefined) {
          return studentLevel >= rank.minLevel;
        }
        return studentLevel >= rank.minLevel && studentLevel <= rank.maxLevel;
      }).length;

      return {
        ...rank,
        studentCount: count,
      };
    });
  }

  /**
   * Get single rank by ID or rankId slug from database
   */
  async getRankById(id: string): Promise<RankTierData> {
    const rank = await this.findRankByIdOrSlug(id);
    if (!rank) {
      throw new ApiError(404, "Rank tier not found");
    }

    const students = await prisma.user.findMany({
      select: { id: true, level: true },
    });

    const count = students.filter((s) => {
      const lvl = s.level ?? 1;
      if (rank.maxLevel === null || rank.maxLevel === undefined) {
        return lvl >= rank.minLevel;
      }
      return lvl >= rank.minLevel && lvl <= rank.maxLevel;
    }).length;

    return {
      ...rank,
      studentCount: count,
    };
  }

  /**
   * Create new rank tier in the database (CMS)
   */
  async createRank(data: CreateRankInput): Promise<RankTierData> {
    if (!data.title || !data.title.trim()) {
      throw new ApiError(400, "Rank title is required");
    }

    if (data.minLevel === undefined || data.minLevel < 1) {
      throw new ApiError(400, "Minimum level must be at least 1");
    }

    if (data.maxLevel !== null && data.maxLevel !== undefined && data.maxLevel < data.minLevel) {
      throw new ApiError(400, "Maximum level cannot be less than minimum level");
    }

    const rankId =
      data.rankId?.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-") ||
      data.title.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-");

    const existing = await prisma.rankTier.findFirst({
      where: { rankId },
    });
    if (existing) {
      throw new ApiError(400, `A rank with identifier "${rankId}" already exists`);
    }

    const minXp =
      data.minXp !== undefined ? data.minXp : this.calculateMinXp(data.minLevel);

    const created = await prisma.rankTier.create({
      data: {
        rankId,
        title: data.title.trim(),
        name: data.name?.trim() || data.title.trim(),
        description: data.description?.trim() || `Reach Level ${data.minLevel} to attain this rank.`,
        minLevel: data.minLevel,
        maxLevel: data.maxLevel ?? null,
        minXp,
        icon: data.icon || "Award",
        color: data.color || "#3B82F6",
        spriteUrl: data.spriteUrl || null,
        perks: Array.isArray(data.perks) ? data.perks : [],
        isActive: data.isActive ?? true,
      },
    });

    return {
      ...created,
      studentCount: 0,
    };
  }

  /**
   * Update rank tier in the database (CMS)
   */
  async updateRank(id: string, data: UpdateRankInput): Promise<RankTierData> {
    const existing = await this.findRankByIdOrSlug(id);
    if (!existing) {
      throw new ApiError(404, "Rank tier not found");
    }

    const minLevel = data.minLevel !== undefined ? data.minLevel : existing.minLevel;
    const maxLevel = data.maxLevel !== undefined ? data.maxLevel : existing.maxLevel;

    if (minLevel < 1) {
      throw new ApiError(400, "Minimum level must be at least 1");
    }

    if (maxLevel !== null && maxLevel !== undefined && maxLevel < minLevel) {
      throw new ApiError(400, "Maximum level cannot be less than minimum level");
    }

    const minXp =
      data.minXp !== undefined
        ? data.minXp
        : data.minLevel !== undefined
        ? this.calculateMinXp(minLevel)
        : existing.minXp;

    const updated = await prisma.rankTier.update({
      where: { id: existing.id },
      data: {
        ...(data.title && { title: data.title.trim() }),
        ...(data.name && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description.trim() }),
        minLevel,
        maxLevel,
        minXp,
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
        ...(data.spriteUrl !== undefined && { spriteUrl: data.spriteUrl }),
        ...(data.perks !== undefined && { perks: Array.isArray(data.perks) ? data.perks : [] }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    // Compute live student count for this rank
    const students = await prisma.user.findMany({
      select: { id: true, level: true },
    });

    const count = students.filter((s) => {
      const lvl = s.level ?? 1;
      if (updated.maxLevel === null || updated.maxLevel === undefined) {
        return lvl >= updated.minLevel;
      }
      return lvl >= updated.minLevel && lvl <= updated.maxLevel;
    }).length;

    return {
      ...updated,
      studentCount: count,
    };
  }

  /**
   * Toggle rank active status in the database (CMS)
   */
  async toggleRankActive(id: string): Promise<RankTierData> {
    const existing = await this.findRankByIdOrSlug(id);
    if (!existing) {
      throw new ApiError(404, "Rank tier not found");
    }

    const updated = await prisma.rankTier.update({
      where: { id: existing.id },
      data: {
        isActive: !existing.isActive,
      },
    });

    return updated;
  }

  /**
   * Delete rank tier from the database (CMS)
   */
  async deleteRank(id: string): Promise<{ success: boolean; message: string }> {
    const existing = await this.findRankByIdOrSlug(id);
    if (!existing) {
      throw new ApiError(404, "Rank tier not found");
    }

    const total = await prisma.rankTier.count();
    if (total <= 1) {
      throw new ApiError(400, "Cannot delete the last remaining rank tier");
    }

    await prisma.rankTier.delete({
      where: { id: existing.id },
    });

    return {
      success: true,
      message: `Rank "${existing.title}" deleted successfully`,
    };
  }

  /**
   * Get real enrolled students inside a rank tier
   */
  async getStudentsInRank(
    id: string,
    options?: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ) {
    const rank = await this.findRankByIdOrSlug(id);
    if (!rank) {
      throw new ApiError(404, "Rank tier not found");
    }

    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const skip = (page - 1) * limit;

    const levelFilter: any = { gte: rank.minLevel };
    if (rank.maxLevel !== null && rank.maxLevel !== undefined) {
      levelFilter.lte = rank.maxLevel;
    }

    const where: any = {
      level: levelFilter,
    };

    if (options?.search && options.search.trim()) {
      const q = options.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          level: true,
          xp: true,
          streak: true,
          verified: true,
          createdAt: true,
        },
        orderBy: [{ level: "desc" }, { xp: "desc" }],
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      rank: {
        id: rank.id,
        rankId: rank.rankId,
        title: rank.title,
        color: rank.color,
        icon: rank.icon,
        minLevel: rank.minLevel,
        maxLevel: rank.maxLevel,
      },
      students,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const gameRankService = new GameRankService();
export default gameRankService;
