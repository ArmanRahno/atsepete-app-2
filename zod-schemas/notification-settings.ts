import { z } from "zod";

export const HourSchema = z.number().int().min(0).max(23);

export const NotificationChannelSettingsSchema = z
	.object({
		enabled: z.boolean().default(true),

		discounts_enabled: z.boolean().default(true),
		discount_min_percent: z.number().int().min(0).max(100).default(0),

		earnings_enabled: z.boolean().default(false),
		earnings_min_amount: z.number().min(0).default(0),

		frequency: z.enum(["instant", "daily"]).default("instant"),
		daily_hour: HourSchema.default(9),

		send_window_enabled: z.boolean().default(false),
		send_window_start_hour: HourSchema.default(9),
		send_window_end_hour: HourSchema.default(21)
	})
	.superRefine((v, ctx) => {
		if (v.send_window_enabled && v.send_window_end_hour < v.send_window_start_hour) {
			ctx.addIssue({
				code: "custom",
				path: ["send_window_end_hour"],
				message: "Bitiş saati başlangıç saatinden küçük olamaz."
			});
		}
	});

export type NotificationChannelSettings = z.infer<typeof NotificationChannelSettingsSchema>;

export const NotificationSettingsSchema = z.object({
	app: NotificationChannelSettingsSchema.default({}),
	email: NotificationChannelSettingsSchema.default({})
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

export const SaveUserNotificationSettingsSchema = z.object({
	channel: z.enum(["app", "email"]),
	settings: NotificationChannelSettingsSchema
});

export type SaveUserNotificationSettingsInput = z.input<typeof SaveUserNotificationSettingsSchema>;
export type SaveUserNotificationSettingsOutput = z.infer<typeof SaveUserNotificationSettingsSchema>;
