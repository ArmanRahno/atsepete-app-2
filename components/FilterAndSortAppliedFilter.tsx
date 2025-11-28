import { lightDestructiveForeground } from "@/constants/Colors";
import { X } from "lucide-react-native";
import { Text, TouchableOpacity, View } from "react-native";

const FilterAndSortAppliedFilter = ({
	children,
	onPress
}: {
	children: React.ReactNode;
	onPress: () => void;
}) => {
	return (
		<TouchableOpacity
			className="flex-row justify-center items-center bg-background border border-border shadow py-0.5 pl-2 pr-1 gap-1 rounded-full"
			onPress={onPress}
		>
			<Text className="text-xs font-medium">{children}</Text>
			<View className="bg-destructive overflow-hidden rounded-full">
				<X
					size={12}
					color={lightDestructiveForeground}
				/>
			</View>
		</TouchableOpacity>
	);
};

export default FilterAndSortAppliedFilter;
