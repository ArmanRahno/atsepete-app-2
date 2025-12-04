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
				href={`https://atsepete.net?r=${referralCode}`}
				displayText={`atsepete.net?r=${referralCode}`}
				shareTitle="Referans Linkini Paylaş"
				shareCaption="Referans kodum:"
			/>
			<UserPageLinkRow
				label="Uygulama İndir"
				href={`https://atsepete.net/indir/${referralCode}`}
				displayText={`atsepete.net/indir/${referralCode}`}
				shareTitle="Uygulama İndirme Linkini Paylaş"
				shareCaption="Atsepete uygulamasını indir:"
			/>
			<UserPageLinkRow
				label="Uzantı İndir"
				href={`https://atsepete.net/uzanti-indir/${referralCode}`}
				displayText={`atsepete.net/uzanti-indir/${referralCode}`}
				shareTitle="Uzantı İndirme Linkini Paylaş"
				shareCaption="Atsepete tarayıcı uzantısını indir:"
			/>
			<UserPageLinkRow
				label="WhatsApp"
				href={`https://atsepete.net/sosyal/whatsapp/${referralCode}`}
				displayText={`atsepete.net/sosyal/whatsapp/${referralCode}`}
				shareTitle="WhatsApp Hesabımızı Paylaş"
				shareCaption="Atsepete WhatsApp kanalını takip et:"
			/>
			<UserPageLinkRow
				label="Telegram"
				href={`https://atsepete.net/sosyal/telegram/${referralCode}`}
				displayText={`atsepete.net/sosyal/telegram/${referralCode}`}
				shareTitle="Telegram Hesabımızı Paylaş"
				shareCaption="Atsepete Telegram kanalını takip et:"
			/>
			<UserPageLinkRow
				label="Twitter"
				href={`https://atsepete.net/sosyal/twitter/${referralCode}`}
				displayText={`atsepete.net/sosyal/twitter/${referralCode}`}
				shareTitle="Twitter Hesabımızı Paylaş"
				shareCaption="Atsepete Twitter hesabını takip et:"
			/>
			<UserPageLinkRow
				label="Influencer Davet"
				href={`https://atsepete.net/influencer-davet/${referralCode}`}
				displayText={`atsepete.net/influencer-davet/${referralCode}`}
				shareTitle="Üye Olma Linkini Paylaş"
				shareCaption="Atsepete influencer programına katıl:"
			/>
		</>
	);
};

export default AccountReferrerLinks;
