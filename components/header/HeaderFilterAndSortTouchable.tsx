import { lightMutedForeground } from "@/constants/Colors";
import { ListFilter } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

const HeaderFilterAndSortTouchable = ({
	setDisplayDialog
}: {
	setDisplayDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	return (
		<TouchableOpacity
			onPress={() => setDisplayDialog(true)}
			className="border border-border p-2 rounded-xl"
		>
			<ListFilter
				size={20}
				color={lightMutedForeground}
			/>
		</TouchableOpacity>
	);
};

export default HeaderFilterAndSortTouchable;
