import { Prisma } from "@prisma/client";
import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createLoyaltyRuleSchema } from "@/lib/validations";

export const GET = async (request: Request) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const rulesPromise = prisma.loyalty_rules.findMany({
      orderBy: { created_at: "desc" },
      include: {
        reward_service: true,
      },
    });

    const rewardsPromise = clientId
      ? prisma.loyalty_rewards.findMany({
          where: { client_id: clientId },
          orderBy: { created_at: "desc" },
          include: {
            rule: true,
            booking: true,
            redeemed_booking: true,
          },
        })
      : Promise.resolve(null);

    const [rules, clientRewards] = await Promise.all([rulesPromise, rewardsPromise]);

    return apiSuccess({
      rules,
      clientRewards,
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to fetch loyalty data", 500);
  }
};

export const POST = async (request: Request) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const body = await request.json();
    const parsed = createLoyaltyRuleSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    if (parsed.data.rewardType === "free_service" && !parsed.data.rewardServiceId) {
      return apiError("rewardServiceId is required for free_service rewards", 422);
    }

    const loyaltyRule = await prisma.loyalty_rules.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        visits_required: parsed.data.visitsRequired,
        reward_type: parsed.data.rewardType,
        reward_value: new Prisma.Decimal(parsed.data.rewardValue),
        reward_service_id: parsed.data.rewardServiceId ?? null,
        is_recurring: parsed.data.isRecurring ?? true,
        is_active: parsed.data.isActive ?? true,
      },
      include: {
        reward_service: true,
      },
    });

    return apiSuccess(loyaltyRule);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to create loyalty rule", 500);
  }
};
