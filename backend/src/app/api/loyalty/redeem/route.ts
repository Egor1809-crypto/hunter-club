import { apiError, apiSuccess, formatZodError } from "@/lib/api";
import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redeemLoyaltyRewardSchema } from "@/lib/validations";

export const POST = async (request: Request) => {
  try {
    const { response } = await requireAdminSession();

    if (response) {
      return response;
    }

    const body = await request.json();
    const parsed = redeemLoyaltyRewardSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(formatZodError(parsed.error), 422);
    }

    const reward = await prisma.loyalty_rewards.findUnique({
      where: { id: parsed.data.rewardId },
    });

    if (!reward) {
      return apiError("Reward not found", 404);
    }

    if (reward.is_redeemed) {
      return apiError("Reward already redeemed", 409);
    }

    const booking = await prisma.bookings.findUnique({
      where: { id: parsed.data.bookingId },
    });

    if (!booking) {
      return apiError("Booking not found", 404);
    }

    const redeemedReward = await prisma.loyalty_rewards.update({
      where: { id: parsed.data.rewardId },
      data: {
        is_redeemed: true,
        redeemed_at: new Date(),
        redeemed_booking_id: parsed.data.bookingId,
      },
      include: {
        client: true,
        rule: true,
        redeemed_booking: true,
      },
    });

    return apiSuccess(redeemedReward);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed to redeem loyalty reward", 500);
  }
};
