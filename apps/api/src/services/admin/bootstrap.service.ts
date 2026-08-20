import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";
import { superAdminCredentials } from "../../config/credentials";

export async function ensureSuperAdminExists() {
  const {
    id,
    employeeId,
    email,
    password,
    firstName,
    lastName,
    name,
    phoneNumber,
    role,
  } = superAdminCredentials;

  try {
    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { id },
          { email },
          { role: "SUPERADMIN" },
        ],
      },
    });

    if (existing) {
      return existing;
    }

    const hash = await hashedPassword(password);
    const newSuperAdmin = await prisma.adminUser.create({
      data: {
        id,
        employeeId,
        name,
        firstName,
        lastName,
        email,
        password: hash,
        role,
        phoneNumber,
        isActive: true,
      },
    });
    console.log("⚡ [Bootstrap] Auto-healed Super Admin account in database (ID:", id, ")");
    return newSuperAdmin;
  } catch (error: any) {
    console.error("❌ [Bootstrap] Error auto-healing Super Admin account:", error?.message || error);
    return null;
  }
}
