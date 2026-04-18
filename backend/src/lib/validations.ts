import { z } from "zod";

export const createClientSchema = z.object({
  phone: z.string().min(10).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
  isVip: z.boolean().optional(),
});

export const updateClientSchema = createClientSchema.partial();

export const serviceUpdateSchema = z.object({
  id: z.string().uuid(),
  price: z.number().nonnegative().optional(),
  durationMin: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateServicesSchema = z.object({
  updates: z.array(serviceUpdateSchema).min(1),
});

export const createBookingSchema = z.object({
  clientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
  source: z.enum(["phone", "walk_in", "website", "admin"]).optional(),
  notes: z.string().optional().nullable(),
});

export const updateBookingSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().optional().nullable(),
  endedAt: z.string().datetime().optional().nullable(),
});

export const createScheduleExceptionSchema = z
  .object({
    exceptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    isDayOff: z.boolean().optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    reason: z.string().max(200).optional().nullable(),
  })
  .superRefine((value, ctx) => {
    if (value.isDayOff === false && (!value.startTime || !value.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startTime"],
        message: "startTime and endTime are required when isDayOff is false",
      });
    }
  });

export const createLoyaltyRuleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  visitsRequired: z.number().int().positive(),
  rewardType: z.enum(["discount_percent", "discount_fixed", "free_service"]),
  rewardValue: z.number().nonnegative(),
  rewardServiceId: z.string().uuid().optional().nullable(),
  isRecurring: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const redeemLoyaltyRewardSchema = z.object({
  rewardId: z.string().uuid(),
  bookingId: z.string().uuid(),
});

export const sendSmsSchema = z.object({
  clientId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  bookingId: z.string().uuid().optional().nullable(),
  type: z.enum(["reminder_24h", "reminder_2h", "loyalty_reward", "custom"]),
});

export const requestPhoneOtpSchema = z.object({
  phone: z.string().min(10).max(25),
});

export const verifyPhoneOtpSchema = z.object({
  phone: z.string().min(10).max(25),
  code: z.string().regex(/^\d{4}$/),
});

export const linkGooglePhoneSchema = z.object({
  phone: z.string().min(10).max(25),
  code: z.string().regex(/^\d{4}$/),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(1).max(255),
});

export const createPublicReviewSchema = z.object({
  customerName: z.string().min(1).max(100),
  serviceLabel: z.string().max(100).optional().nullable(),
  rating: z.number().int().min(1).max(5),
  message: z.string().min(10).max(2000),
});

export const updateReviewSchema = z.object({
  status: z.enum(["new", "published", "archived"]).optional(),
});
