import { z } from "zod";
import AddressValidator from "multicoin-address-validator";

export const USDTAddressSchema = z
	.string()
	.trim()
	.refine(
		address => {
			try {
				const isValid = AddressValidator.validate(address, "TRX");
				return isValid;
			} catch (e) {
				console.log(e);
				return false;
			}
		},
		{
			message: "Geçersiz USDT (TRC20) adresi"
		}
	);

export type USDTAddress = z.infer<typeof USDTAddressSchema>;
