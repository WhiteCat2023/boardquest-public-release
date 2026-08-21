import "dotenv/config";
import prisma from "../services/prisma";
import { seedStudents } from "./student";

async function main() {
  console.log("------------------------------------------");
  console.log("🚀 Starting Standalone Student Seeder...");
  console.log("------------------------------------------");
  try {
    await seedStudents(prisma);
    console.log("✅ Student seeding completed successfully!");
  } catch (error) {
    console.error("❌ Student seeding failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
