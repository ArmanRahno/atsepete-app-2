import { lightMutedForeground } from "@/constants/Colors";
import { Filter } from "lucide-react-native";
import { TouchableOpacity } from "react-native";
import AppTouchableOpacity from "../AppTouchableOpacity";

const HeaderFilterAndSortTouchable = ({
	setDisplayDialog
}: {
	setDisplayDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	return (
		<AppTouchableOpacity
			onPress={() => setDisplayDialog(true)}
			className="border border-border p-2.5 rounded-xl"
			hitSlop={10}
		>
			<Filter
				size={24}
				color={lightMutedForeground}
			/>
		</AppTouchableOpacity>
	);
};

export default HeaderFilterAndSortTouchable;
