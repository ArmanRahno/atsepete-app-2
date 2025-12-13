import { Pressable, View } from "react-native";
import HeaderText from "./HeaderText";
import AtSepeteIcon from "@/assets/icons/AtSepeteIcon";
import * as Linking from "expo-linking";

const HeaderIcon = () => {
	const handlePress = () => {
		Linking.openURL("https://atsepete.net/");
	};

	return (
		<Pressable
			className="self-center flex-row items-center gap-2"
			onPress={handlePress}
		>
			<View
				className="bg-primary justify-center items-center rounded-full"
				style={{ height: 22, width: 22 }}
			>
				<AtSepeteIcon
					height={14}
					width={14}
					fill="white"
					stroke="white"
					strokeWidth={4}
				/>
			</View>
			<HeaderText className="text-base">AtSepete.Net</HeaderText>
		</Pressable>
	);
};

export default HeaderIcon;
