import { z } from "zod";
import AddressValidator from "multicoin-address-validator";

export const USDTTronAddressSchema = z
	.string()
	.length(34, "USDT Tron (TRC20) adresi 34 karakterden oluşmalıdır.")
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
			message: "Geçersiz USDT Tron (TRC20) adresi"
		}
	);

export type USDTTronAddress = z.infer<typeof USDTTronAddressSchema>;
