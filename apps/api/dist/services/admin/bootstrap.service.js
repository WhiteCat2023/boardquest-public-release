import prisma from "../prisma";
import { hashedPassword } from "../../utils/hash";
export async function ensureSuperAdminExists() {
    const default_id = process.env.SUPERADMIN_DEFAULT_ID;
    const email = process.env.SUPERADMIN_EMAIL?.toLowerCase();
    const password = process.env.SUPERADMIN_PASSWORD;
    const username = process.env.SUPERADMIN_USERNAME;
    const employeeId = process.env.SUPERADMIN_EMPLOYEE_ID;
    const phoneNumber = process.env.SUPERADMIN_PHONE_NUMBER;
    const lastName = process.env.SUPERADMIN_LASTNAME;
    const firstName = process.env.SUPERADMIN_FIRSTNAME;
    try {
        const existing = await prisma.adminUser.findFirst({
            where: {
                OR: [
                    { id: default_id },
                    { email },
                    { username },
                    { role: "SUPERADMIN" },
                ],
            },
        });
        if (existing) {
            return existing;
        }
        const name = `${firstName} ${lastName}`;
        const hash = await hashedPassword(password);
        const newSuperAdmin = await prisma.adminUser.create({
            data: {
                id: default_id,
                employeeId,
                name,
                firstName,
                lastName,
                email,
                username,
                password: hash,
                role: "SUPERADMIN",
                phoneNumber,
                isActive: true,
            },
        });
        console.log("⚡ [Bootstrap] Auto-healed Super Admin account in database (ID:", default_id, ")");
        return newSuperAdmin;
    }
    catch (error) {
        console.error("❌ [Bootstrap] Error auto-healing Super Admin account:", error?.message || error);
        return null;
    }
}
