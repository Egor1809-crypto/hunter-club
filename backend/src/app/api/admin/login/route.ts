import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { createSessionToken, setAdminSessionCookie, verifyAdminPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { adminLoginSchema } from "@/lib/validations";

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const adminUser = await prisma.admin_users.findUnique({
      where: { username: parsed.data.username },
    });

    if (!adminUser || !adminUser.is_active) {
      return apiError("Неверный логин или пароль", 401);
    }

    const isValidPassword = await verifyAdminPassword({
      plainPassword: parsed.data.password,
      storedHash: adminUser.password_hash,
    });

    if (!isValidPassword) {
      return apiError("Неверный логин или пароль", 401);
    }

    await prisma.admin_users.update({
      where: { id: adminUser.id },
      data: { last_login_at: new Date() },
    });

    const sessionToken = createSessionToken(adminUser);
    setAdminSessionCookie(sessionToken);

    return apiSuccess({
      id: adminUser.id,
      username: adminUser.username,
      displayName: adminUser.display_name,
      role: adminUser.role,
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось выполнить вход", 500);
  }
};
