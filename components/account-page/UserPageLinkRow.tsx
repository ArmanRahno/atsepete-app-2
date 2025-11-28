import { Card } from "../shad-cn/card";
import { Linking, Pressable, View, Text } from "react-native";
import ShareDialog from "../item/ShareDialog";
import CopyBtn from "../CopyBtn";

type Props = {
	label: string;
	href: string;
	displayText?: string;
	shareTitle: string;
};

const UserPageLinkRow = ({ label, href, displayText, shareTitle }: Props) => {
	const shortText = (displayText ?? href).replace(/^https?:\/\//, "").trim();

	return (
		<Card className="flex-row px-4 py-2">
			<View className="flex-row items-center gap-2 flex-1 min-w-0">
				<Text
					className="text-base font-medium whitespace-nowrap"
					style={{ fontFamily: "Roboto_500Medium" }}
					numberOfLines={1}
				>
					{label}:
				</Text>
				<Pressable
					className="flex-1 min-w-0"
					onPress={() => Linking.openURL(href)}
				>
					<Text
						className="text-blue-600"
						style={{ fontFamily: "Roboto_500Medium" }}
						numberOfLines={1}
						ellipsizeMode="tail"
					>
						{shortText}
					</Text>
				</Pressable>
			</View>

			<View className="flex-row items-center gap-2 flex-shrink-0">
				<CopyBtn
					copyVal={href}
					size={20}
				/>
				<ShareDialog
					shareMessage={shareTitle}
					shareUrl={href}
					pressableClassName="px-2 py-2"
				/>
			</View>
		</Card>
	);
};

export default UserPageLinkRow;
