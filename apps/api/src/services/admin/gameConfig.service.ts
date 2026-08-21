import prisma from "../prisma";
import { defaultGameConfig } from "../../seeds/game";

export interface UpdateGameConfigInput {
  baseXP?: number;
  xpMultiplier?: number;
  streakBonusPercentage?: number;
  accuracyThreshold?: number;
  levelUpXpBase?: number;
  maxLevelCap?: number;
}

export class GameConfigService {
  /**
   * Get current game engine configuration (or create default if absent)
   */
  async getConfig() {
    let config = await prisma.gameConfig.findUnique({
      where: { key: "default" },
    });

    if (!config) {
      config = await prisma.gameConfig.create({
        data: { ...defaultGameConfig },
      });
    }

    return config;
  }

  /**
   * Update game engine configuration
   */
  async updateConfig(data: UpdateGameConfigInput) {
    const existing = await this.getConfig();

    return prisma.gameConfig.update({
      where: { id: existing.id },
      data: {
        ...(data.baseXP !== undefined && { baseXP: Number(data.baseXP) }),
        ...(data.xpMultiplier !== undefined && { xpMultiplier: Number(data.xpMultiplier) }),
        ...(data.streakBonusPercentage !== undefined && { streakBonusPercentage: Number(data.streakBonusPercentage) }),
        ...(data.accuracyThreshold !== undefined && { accuracyThreshold: Number(data.accuracyThreshold) }),
        ...(data.levelUpXpBase !== undefined && { levelUpXpBase: Number(data.levelUpXpBase) }),
        ...(data.maxLevelCap !== undefined && { maxLevelCap: Number(data.maxLevelCap) }),
      },
    });
  }
}

export const gameConfigService = new GameConfigService();
