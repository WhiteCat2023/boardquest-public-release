import { PrismaClient } from "../../generated/prisma/client";
import { demoAdminUsers } from "../seeds/user";
import { demoCategories } from "../seeds/category";
import { demoQuestions } from "../seeds/questions";
import { hashedPassword } from "../utils/hash";

const prisma = new PrismaClient();

export async function seedAdminUserDb() {
  try {
    console.log("Seeding users...");
    for (const user of demoAdminUsers) {
      const hashedPass = await hashedPassword(user.password);
      await prisma.adminUser.upsert({
        where: { id: user.id },
        update: {},
        create: { ...user, password: hashedPass },
      }).catch((e) => console.warn(`User seed note: ${e.message}`));
    }
    console.log("Users seeded successfully!");

    console.log("Seeding categories...");
    for (const category of demoCategories) {
      await prisma.category.upsert({
        where: { id: category.id },
        update: {},
        create: category,
      }).catch((e) => console.warn(`Category seed note: ${e.message}`));
    }
    console.log("Categories seeded successfully!");

    console.log("Seeding questions...");
    for (const question of demoQuestions) {
      const { id, ...updateData } = question;
      await prisma.question.upsert({
        where: { id },
        update: { ...updateData, isPublished: false },
        create: { ...question, isPublished: false },
      }).catch((e) => console.warn(`Question seed note: ${e.message}`));
    }
    console.log("Questions seeded successfully!");
  } catch (error: any) {
    console.error("Error during database seeding:", error?.message || error);
  }
}

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });

export default prisma;