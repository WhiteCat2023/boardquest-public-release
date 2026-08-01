import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";

export const SUPERADMIN_DEFAULT_ID = "000000000000000000000001";

export async function ensureSuperAdminExists() {
  const email = (process.env.SUPERADMIN_EMAIL || "superadmin@boardquest.edu.ph").toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || "SuperAdmin123!";
  const name = process.env.SUPERADMIN_NAME || "System Super Administrator";
  const username = process.env.SUPERADMIN_USERNAME || "superadmin";

  try {
    const existing = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { id: SUPERADMIN_DEFAULT_ID },
          { email },
          { username },
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
        id: SUPERADMIN_DEFAULT_ID,
        employeeId: "SA-0001",
        name,
        email,
        username,
        password: hash,
        role: "SUPERADMIN",
        phoneNumber: "09000000000",
        isActive: true,
      },
    });
    console.log("⚡ [Bootstrap] Auto-healed Super Admin account in database (ID:", SUPERADMIN_DEFAULT_ID, ")");
    return newSuperAdmin;
  } catch (error: any) {
    console.error("❌ [Bootstrap] Error auto-healing Super Admin account:", error?.message || error);
    return null;
  }
}
