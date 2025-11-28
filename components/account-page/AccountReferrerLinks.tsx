import { Text } from "react-native";
import UserPageLinkRow from "./UserPageLinkRow";

const AccountReferrerLinks = ({ referralCode }: { referralCode: string | null | undefined }) => {
	if (!referralCode) return null;

	return (
		<>
			<Text
				className="pt-4 mb-2 text-xl"
				style={{ fontFamily: "Roboto_700Bold" }}
			>
				Paylaşım Linkleriniz
			</Text>
			<Text className="text-sm text-muted-foreground mb-4">
				Bu bağlantıları paylaştığınızda, sizin referansınızla gelen kullanıcılardan kazanç
				elde edersiniz.
			</Text>
			<UserPageLinkRow
				label="Referans Linki"
				href={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app?r=${referralCode}`}
				displayText={`atsepete.net?r=${referralCode}`}
				shareTitle="Referans Linkini Paylaş"
			/>
			<UserPageLinkRow
				label="Uygulama İndir"
				href={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/indir/${referralCode}`}
				displayText={`atsepete.net/indir/${referralCode}`}
				shareTitle="Uygulama İndirme Linkini Paylaş"
			/>
			<UserPageLinkRow
				label="Uzantı İndir"
				href={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/uzanti-indir/${referralCode}`}
				displayText={`atsepete.net/uzanti-indir/${referralCode}`}
				shareTitle="Uzantı İndirme Linkini Paylaş"
			/>
			<UserPageLinkRow
				label="WhatsApp"
				href={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/sosyal/whatsapp/${referralCode}`}
				displayText={`atsepete.net/sosyal/whatsapp/${referralCode}`}
				shareTitle="WhatsApp Hesabımızı Paylaş"
			/>
			<UserPageLinkRow
				label="Telegram"
				href={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/sosyal/telegram/${referralCode}`}
				displayText={`atsepete.net/sosyal/telegram/${referralCode}`}
				shareTitle="Telegram Hesabımızı Paylaş"
			/>
			<UserPageLinkRow
				label="Twitter"
				href={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/sosyal/twitter/${referralCode}`}
				displayText={`atsepete.net/sosyal/twitter/${referralCode}`}
				shareTitle="Twitter Hesabımızı Paylaş"
			/>
			<UserPageLinkRow
				label="Influencer Davet"
				href={`https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/influencer-davet/${referralCode}`}
				displayText={`atsepete.net/influencer-davet/${referralCode}`}
				shareTitle="Üye Olma Linkini Paylaş"
			/>
		</>
	);
};

export default AccountReferrerLinks;
