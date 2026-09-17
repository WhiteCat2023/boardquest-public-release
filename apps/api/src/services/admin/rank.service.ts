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

// Canonical BoardQuesters Aspirant Ranks
const DEFAULT_RANK_TIERS: RankTierData[] = [
  {
    id: "rank-apprentice-tier",
    rankId: "apprentice",
    title: "Apprentice Technician",
    name: "Apprentice Technician",
    description: "Beginning the clinical journey. Mastering foundational lab terminology and fundamental procedures.",
    minLevel: 1,
    maxLevel: 9,
    minXp: 0, // (1 - 1)^2 * 100 = 0
    icon: "Award",
    color: "#64748B", // Slate
    spriteUrl: null,
    perks: ["Access to Practice Quiz Arena", "Daily Quest Rewards", "Public Profile"],
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "rank-adept-tier",
    rankId: "adept",
    title: "Adept Analyst",
    name: "Adept Analyst",
    description: "Demonstrating clinical competency. Solving intermediate case studies and complex diagnostic questions.",
    minLevel: 10,
    maxLevel: 24,
    minXp: 8100, // (10 - 1)^2 * 100 = 8,100
    icon: "Star",
    color: "#3B82F6", // Blue
    spriteUrl: null,
    perks: ["10% XP Multiplier", "Unlock Advanced Subject Quizzes", "Adept Analyst Badge Frame"],
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "rank-senior-tier",
    rankId: "senior",
    title: "Senior Scientist",
    name: "Senior Scientist",
    description: "Advanced diagnostic mastery. High-accuracy problem solving under timed exam simulations.",
    minLevel: 25,
    maxLevel: 49,
    minXp: 57600, // (25 - 1)^2 * 100 = 57,600
    icon: "Trophy",
    color: "#A855F7", // Purple
    spriteUrl: null,
    perks: ["20% XP Multiplier", "Boss Arena Priority Matchmaking", "Senior Diagnostic Prescriptions"],
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "rank-grandmaster-tier",
    rankId: "grandmaster",
    title: "Grandmaster Pathologist",
    name: "Grandmaster Pathologist",
    description: "Peak elite medical laboratory excellence. Unrivaled diagnostic accuracy across all subjects.",
    minLevel: 50,
    maxLevel: null,
    minXp: 240100, // (50 - 1)^2 * 100 = 240,100
    icon: "Crown",
    color: "#F59E0B", // Amber
    spriteUrl: null,
    perks: ["35% XP Multiplier", "Legendary Crown Aura", "Hall of Fame Leaderboard Display"],
    isActive: true,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
];

// Runtime store for CMS CRUD mutations
let customRanksStore: RankTierData[] = [...DEFAULT_RANK_TIERS];

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
   * Get all ranks with live student count aggregated from real DB users
   */
  async getAllRanks(options?: {
    search?: string;
    status?: string;
    activeOnly?: boolean;
  }): Promise<RankTierData[]> {
    // 1. Fetch real student level distributions from MongoDB (User model)
    const students = await prisma.user.findMany({
      select: {
        id: true,
        level: true,
      },
    });

    // 2. Filter store by options
    let filtered = [...customRanksStore];

    if (options?.activeOnly) {
      filtered = filtered.filter((r) => r.isActive);
    }

    if (options?.status && options.status !== "ALL") {
      if (options.status.toLowerCase() === "active") {
        filtered = filtered.filter((r) => r.isActive);
      } else if (options.status.toLowerCase() === "inactive") {
        filtered = filtered.filter((r) => !r.isActive);
      }
    }

    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.rankId.toLowerCase().includes(q)
      );
    }

    // Sort by minLevel ascending
    filtered.sort((a, b) => a.minLevel - b.minLevel);

    // 3. Compute live enrolled student count for each rank tier
    return filtered.map((rank) => {
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
   * Get single rank by ID or rankId slug
   */
  async getRankById(id: string): Promise<RankTierData> {
    const rank = customRanksStore.find((r) => r.id === id || r.rankId === id);
    if (!rank) {
      throw new ApiError(404, "Rank tier not found");
    }

    // Count students
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
   * Create new rank tier (CMS)
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
      data.rankId?.trim().toLowerCase().replace(/[^a-z0-9]/g, "-") ||
      data.title.trim().toLowerCase().replace(/[^a-z0-9]/g, "-");

    const existing = customRanksStore.find((r) => r.rankId === rankId);
    if (existing) {
      throw new ApiError(400, `A rank with identifier "${rankId}" already exists`);
    }

    const minXp =
      data.minXp !== undefined ? data.minXp : this.calculateMinXp(data.minLevel);

    const newRank: RankTierData = {
      id: `rank-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    customRanksStore.push(newRank);
    return newRank;
  }

  /**
   * Update rank tier (CMS)
   */
  async updateRank(id: string, data: UpdateRankInput): Promise<RankTierData> {
    const index = customRanksStore.findIndex((r) => r.id === id || r.rankId === id);
    if (index === -1) {
      throw new ApiError(404, "Rank tier not found");
    }

    const current = customRanksStore[index];

    const minLevel = data.minLevel !== undefined ? data.minLevel : current.minLevel;
    const maxLevel = data.maxLevel !== undefined ? data.maxLevel : current.maxLevel;

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
        : current.minXp;

    const updated: RankTierData = {
      ...current,
      title: data.title?.trim() || current.title,
      name: data.name?.trim() || (data.title?.trim() ?? current.name),
      description: data.description !== undefined ? data.description.trim() : current.description,
      minLevel,
      maxLevel,
      minXp,
      icon: data.icon || current.icon,
      color: data.color || current.color,
      spriteUrl: data.spriteUrl !== undefined ? data.spriteUrl : current.spriteUrl,
      perks: data.perks !== undefined ? data.perks : current.perks,
      isActive: data.isActive !== undefined ? data.isActive : current.isActive,
      updatedAt: new Date(),
    };

    customRanksStore[index] = updated;
    return updated;
  }

  /**
   * Toggle rank active status (CMS)
   */
  async toggleRankActive(id: string): Promise<RankTierData> {
    const index = customRanksStore.findIndex((r) => r.id === id || r.rankId === id);
    if (index === -1) {
      throw new ApiError(404, "Rank tier not found");
    }

    customRanksStore[index].isActive = !customRanksStore[index].isActive;
    customRanksStore[index].updatedAt = new Date();
    return customRanksStore[index];
  }

  /**
   * Delete rank tier (CMS)
   */
  async deleteRank(id: string): Promise<{ success: boolean; message: string }> {
    const index = customRanksStore.findIndex((r) => r.id === id || r.rankId === id);
    if (index === -1) {
      throw new ApiError(404, "Rank tier not found");
    }

    const rank = customRanksStore[index];
    // Safeguard: Ensure at least one active rank remains
    if (customRanksStore.length <= 1) {
      throw new ApiError(400, "Cannot delete the last remaining rank tier");
    }

    customRanksStore.splice(index, 1);
    return {
      success: true,
      message: `Rank "${rank.title}" deleted successfully`,
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
    const rank = customRanksStore.find((r) => r.id === id || r.rankId === id);
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
