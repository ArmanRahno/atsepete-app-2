import { View } from "react-native";
import { Star } from "lucide-react-native";

const ReviewStars = ({ value, size }: { value: number; size?: number }) => {
	return (
		<View>
			<View className="relative">
				<View className="flex-row">
					{Array.from({ length: 5 }).map((_, i) => (
						<Star
							key={i}
							width={size || 14}
							height={size || 14}
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
							width={size || 14}
							height={size || 14}
							className="flex-shrink-0"
							color="rgb(251, 146, 60)"
							fill="rgb(251, 146, 60)"
						/>
					))}
				</View>
			</View>
		</View>
	);
};

export default ReviewStars;
