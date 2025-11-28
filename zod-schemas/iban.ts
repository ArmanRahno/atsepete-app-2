import z from "zod";

export const IBANSchema = z
	.string()
	.trim()
	.refine(iban => /^TR\d{24}$/.test(iban.replace(/\s+/g, "").toUpperCase()), {
		message: "IBAN adresi TR ile başlamalıdır ve 26 karakterden oluşmalıdır."
	})
	.refine(
		iban => {
			const cleanIBAN = iban.replace(/\s+/g, "").toUpperCase();

			const rearranged = cleanIBAN.slice(4) + cleanIBAN.slice(0, 4);

			const numericIBAN = rearranged.replace(/[A-Z]/g, char =>
				String(char.charCodeAt(0) - 55)
			);

			const remainder = BigInt(numericIBAN) % BigInt(97);

			return remainder === BigInt(1);
		},
		{
			message: "Geçersiz IBAN adresi."
		}
	);

export type IBAN = z.infer<typeof IBANSchema>;
