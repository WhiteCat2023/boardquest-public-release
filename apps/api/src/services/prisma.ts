import { PrismaClient, LogLevel } from "@prisma/client";
import { demoAdminUsers } from "../seeds/user";
import { demoCategories } from "../seeds/category";
import { demoQuestions } from "../seeds/questions";
import {
  demoReviewCenters,
  demoReviewCenterRepresentatives,
  demoReviewSchedules,
} from "../seeds/reviewCenter";
import { demoSystemLogs } from "../seeds/logs";
import { initialBadges, defaultGameConfig } from "../seeds/game";
import { hashedPassword } from "../utils/hash";
import { ensureSuperAdminExists } from "./admin/bootstrap.service";

const prisma = new PrismaClient();

export async function seedAdminUserDb() {
  try {
    await ensureSuperAdminExists();

    console.log("Seeding users...");
    for (const user of demoAdminUsers) {
      const hashedPass = await hashedPassword(user.password);
      await prisma.adminUser
        .upsert({
          where: { id: user.id },
          update: {},
          create: { ...user, password: hashedPass },
        })
        .catch((e) => console.warn(`User seed note: ${e.message}`));
    }
    console.log("Users seeded successfully!");

    console.log("Seeding categories...");
    for (const category of demoCategories) {
      await prisma.category
        .upsert({
          where: { id: category.id },
          update: {},
          create: { ...category },
        })
        .catch((e) => console.warn(`Category seed note: ${e.message}`));
    }
    console.log("Categories seeded successfully!");

    console.log("Seeding questions...");
    for (const question of demoQuestions) {
      const { id, ...updateData } = question;
      await prisma.question
        .upsert({
          where: { id },
          update: { ...updateData },
          create: { ...question },
        })
        .catch((e) => console.warn(`Question seed note: ${e.message}`));
    }
    console.log("Questions seeded successfully!");

    console.log("Seeding review centers...");
    for (const rc of demoReviewCenters) {
      await prisma.reviewCenter
        .upsert({
          where: { id: rc.id },
          update: {},
          create: { ...rc },
        })
        .catch((e) => console.warn(`Review center seed note: ${e.message}`));
    }
    for (const rep of demoReviewCenterRepresentatives) {
      await prisma.reviewCenterRepresentativeUser
        .upsert({
          where: { id: rep.id },
          update: {},
          create: {
            ...rep,
            password: await hashedPassword("ReviewCenter123!"),
          },
        })
        .catch((e) => console.warn(`Review rep seed note: ${e.message}`));
    }
    console.log("Review centers seeded successfully!");

    console.log("Seeding review schedules...");
    for (const prog of demoReviewSchedules) {
      await prisma.reviewCenterProgram
        .upsert({
          where: { id: prog.id },
          update: {},
          create: { ...prog },
        })
        .catch((e) => console.warn(`Review schedule seed note: ${e.message}`));
    }
    console.log("Review schedules seeded successfully!");

    console.log("Seeding system logs...");
    for (const log of demoSystemLogs) {
      await prisma.systemLog
        .upsert({
          where: { id: log.id },
          update: {},
          create: {
            level: log.level as LogLevel,
            action: log.action,
            message: log.message,
            source: log.source,
            userEmail: log.userEmail,
            ipAddress: log.ipAddress,
            metadata: log.metadata,
            createdAt: log.createdAt,
          },
        })
        .catch((e: any) => console.warn(`System log seed note: ${e.message}`));
    }
    console.log("System logs seeded successfully!");

    console.log("Seeding badges and game config...");
    for (const badge of initialBadges) {
      await prisma.badge.upsert({
        where: { badgeId: badge.badgeId },
        update: {},
        create: { ...badge },
      }).catch((e: any) => console.warn(`Badge seed note: ${e.message}`));
    }
    await prisma.gameConfig.upsert({
      where: { key: defaultGameConfig.key },
      update: {},
      create: { ...defaultGameConfig },
    }).catch((e: any) => console.warn(`Game config seed note: ${e.message}`));
    console.log("Badges and game config seeded successfully!");
  } catch (error: any) {
    console.error("Error during database seeding:", error?.message || error);
  }
}

export default prisma;
