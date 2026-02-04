import React, { Fragment } from "react";
import { AccountAPIResponse } from "@/app/(tabs)/alarms";
import AccountReferrerLinks from "./AccountReferrerLinks";

interface AccountSettingsProps {
	userData: AccountAPIResponse;
}

export default function AccountSettings({ userData }: AccountSettingsProps) {
	const referralCode =
		(userData as any)?.user?.referrer_code ?? (userData as any)?.referrer_code ?? "";

	return (
		<Fragment>
			<AccountReferrerLinks referralCode={referralCode} />
		</Fragment>
	);
}
