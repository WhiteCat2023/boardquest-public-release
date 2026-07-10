import { PrismaClient } from "../../generated/prisma/client";
import { demoAdminUsers } from "../seeds/user";
import { demoCategories } from "../seeds/category";
import { demoQuestions } from "../seeds/questions";
import { hashedPassword } from "../utils/hash";

const prisma = new PrismaClient();

export async function seedAdminUserDb() {
    console.log("Seeding users...");
    for (const user of demoAdminUsers) {
        const hashedPass = await hashedPassword(user.password);
        await prisma.adminUser.upsert({
          where: { id: user.id},
          update: {},
          create: { ...user, password: hashedPass },
        });
    }
    console.log("Users seeded successfully!");

    console.log("Seeding categories...");
    for (const category of demoCategories) {
        await prisma.category.upsert({
          where: { id: category.id },
          update: {},
          create: category,
        });
    }
    console.log("Categories seeded successfully!");

    console.log("Seeding questions...");
    for (const question of demoQuestions) {
        await prisma.question.upsert({
          where: { id: question.id },
          update: {},
          create: question,
        });
    }
    console.log("Questions seeded successfully!");
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