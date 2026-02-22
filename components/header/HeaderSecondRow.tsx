import { View } from "react-native";
import HeaderSearchInput from "./HeaderSearchInput";

const HeaderSecondRow = () => {
	return (
		<View className="flex-row gap-2">
			<HeaderSearchInput />
		</View>
	);
};

export default HeaderSecondRow;
