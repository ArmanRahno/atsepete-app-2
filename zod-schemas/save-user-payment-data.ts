import z from "zod";
import { IBANSchema } from "./iban";
import { USDTAddressSchema } from "./usdt";
import { ETHAddressSchema } from "./ethereum";

export const PaymentSchema = z.object({
	preferred_option: z
		.enum(["banka-transferi", "kripto", "hediye-karti"])
		.default("banka-transferi"),
	"ad-soyad": z.optional(z.string()),
	"banka-transferi": IBANSchema.optional().or(z.string().length(0)),
	"tercih-edilen-kripto": z.enum(["usdt", "ethereum"]).default("usdt"),
	"usdt": USDTAddressSchema.optional().or(z.string().length(0)),
	"ethereum": ETHAddressSchema.optional().or(z.string().length(0)),

	// For backwards compatibility. We don't use this now.
	kripto: z.string().optional().or(z.string().length(0)),

	"hediye-karti": z.optional(z.string())
});

export const PaymentSchemaFrontend = PaymentSchema.refine(
	f => f.preferred_option !== "banka-transferi" || !!f["ad-soyad"]?.trim(),
	{ path: ["ad-soyad"], message: "Banka ödemesi için ad soyad gereklidir." }
)
	.refine(
		f =>
			f.preferred_option !== "banka-transferi" ||
			IBANSchema.safeParse(f["banka-transferi"]).success,
		{ path: ["banka-transferi"], message: "Geçerli bir IBAN gereklidir." }
	)
	.refine(
		f =>
			f.preferred_option !== "kripto" ||
			f["tercih-edilen-kripto"] !== "usdt" ||
			USDTAddressSchema.safeParse(f.usdt).success,
		{ path: ["usdt"], message: "Geçerli bir USDT (TRC20) adresi gereklidir." }
	)
	.refine(
		f =>
			f.preferred_option !== "kripto" ||
			f["tercih-edilen-kripto"] !== "ethereum" ||
			ETHAddressSchema.safeParse(f.ethereum).success,
		{ path: ["ethereum"], message: "Geçerli bir Ethereum (ERC20) adresi gereklidir." }
	);

export type Payment = z.infer<typeof PaymentSchema>;

export const SaveUserPaymentDataSchema = z.object({
	payment_data: PaymentSchema
});

export type SaveUserPaymentDataInput = z.input<typeof SaveUserPaymentDataSchema>;
export type SaveUserPaymentDataOutput = z.infer<typeof SaveUserPaymentDataSchema>;
