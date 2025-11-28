import { Pressable, View } from "react-native";
import HeaderText from "./HeaderText";
import AtSepeteIcon from "@/assets/icons/AtSepeteIcon";
import * as Linking from "expo-linking";

const HeaderIcon = () => {
	const handlePress = () => {
		Linking.openURL("https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/");
	};

	return (
		<Pressable
			className="self-center flex-row items-center gap-2"
			onPress={handlePress}
		>
			<View
				className="bg-primary justify-center items-center rounded-full"
				style={{ height: 28, width: 28 }}
			>
				<AtSepeteIcon
					height={18}
					width={18}
					fill="white"
					stroke="white"
					strokeWidth={4}
				/>
			</View>
			<HeaderText className="text-xl">AtSepete.Net</HeaderText>
		</Pressable>
	);
};

export default HeaderIcon;
