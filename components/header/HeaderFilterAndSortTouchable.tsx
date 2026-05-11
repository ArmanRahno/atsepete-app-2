import { Filter } from "lucide-react-native";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useThemePalette } from "@/hooks/useThemePalette";

const HeaderFilterAndSortTouchable = ({
	setDisplayDialog
}: {
	setDisplayDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
	const { colors } = useThemePalette();

	return (
		<AppTouchableOpacity
			onPress={() => setDisplayDialog(true)}
			className="border border-border p-2.5 rounded-xl"
			hitSlop={10}
		>
			<Filter
				size={24}
				color={colors.mutedForeground}
			/>
		</AppTouchableOpacity>
	);
};

export default HeaderFilterAndSortTouchable;
