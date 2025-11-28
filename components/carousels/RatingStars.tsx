import { Star } from "lucide-react-native";
import { Text, View } from "react-native";

const RatingStars = ({ value }: { value: Item["rating"] }) => {
	if (!value) return;

	return (
		<View className="self-start flex-row items-center gap-2 w-fit rounded px-2 py-1 bg-muted">
			<View className="relative">
				<View className="flex-row">
					{Array.from({ length: 5 }).map((_, i) => (
						<Star
							key={i}
							width={16}
							height={16}
							color="rgb(209, 213, 219)"
							fill="rgb(209, 213, 219)"
						/>
					))}
				</View>

				<View
					className="absolute top-0 flex-row overflow-hidden"
					style={{ width: `${value * 20}%` }}
				>
					{Array.from({ length: 5 }).map((_, i) => (
						<Star
							key={i}
							width={16}
							height={16}
							className="flex-shrink-0"
							color="rgb(251, 146, 60)"
							fill="rgb(251, 146, 60)"
						/>
					))}
				</View>
			</View>

			<Text className="text-lg font-medium"> {value}</Text>
		</View>
	);
};

export default RatingStars;
