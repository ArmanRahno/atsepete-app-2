import React, { Fragment, useCallback } from "react";
import * as Clipboard from "expo-clipboard";
import { AccountAPIResponse } from "@/app/(tabs)/alarms";
import * as Linking from "expo-linking";
import AccountReferrerLinks from "./AccountReferrerLinks";

interface AccountSettingsProps {
	userData: AccountAPIResponse;
}

const DOWNLOAD_APP_LINK =
	"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/indir";

export default function AccountSettings({ userData }: AccountSettingsProps) {
	const userRefLink = `https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/?r=${
		userData?.referrer_code || ""
	}`;

	const userDownloadLink = `${DOWNLOAD_APP_LINK}/${userData?.referrer_code}`;

	const copyToClipboard = useCallback(async (text: string) => {
		await Clipboard.setStringAsync(text);
	}, []);

	const openLink = useCallback((url: string) => {
		Linking.openURL(url).catch(err => {
			console.warn("Link kopyalanamadı:", err);
		});
	}, []);

	return (
		<Fragment>
			<AccountReferrerLinks referralCode={userData?.referrer_code} />
		</Fragment>
	);
}
