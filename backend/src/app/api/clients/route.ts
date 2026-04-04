import { apiError, apiSuccess, formatZodError, parsePagination } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createClientSchema } from "@/lib/validations";

export const GET = async (request: Request) => {
  const { response } = await requireAdminSession();

  if (response) {
    return response;
  }

  const { searchParams } = new URL(request.url);
  const { page, pageSize, skip, take } = parsePagination(searchParams);
  const search = searchParams.get("search")?.trim();
  const sortBy = searchParams.get("sortBy") ?? "last_visit_at";
  const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";

  const where = search
    ? {
        OR: [
          { first_name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.clients.findMany({
      where,
      skip,
      take,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.clients.count({ where }),
  ]);

  return apiSuccess(items, { total, page, pageSize });
};

export const POST = async (request: Request) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const client = await prisma.clients.create({
      data: {
        phone: parsed.data.phone,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName ?? null,
        notes: parsed.data.notes ?? null,
        is_vip: parsed.data.isVip ?? false,
      },
    });

    return apiSuccess(client);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Не удалось создать клиента", 500);
  }
};
