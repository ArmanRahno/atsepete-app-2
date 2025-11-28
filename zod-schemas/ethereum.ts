import { z } from "zod";
import AddressValidator from "multicoin-address-validator";

export const ETHAddressSchema = z
	.string()
	.trim()
	.refine(
		address => {
			try {
				const isValid = AddressValidator.validate(address, "ETH");
				return isValid;
			} catch (e) {
				console.log(e);
				return false;
			}
		},
		{
			message: "Geçersiz Ethereum (ERC20) adresi"
		}
	);

export type ETHAddress = z.infer<typeof ETHAddressSchema>;
