import formatPrice from "@/lib/formatPrice";
import { Link } from "expo-router";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

export default function ItemCardMiddleRow({
	price_history,
	last_price,
	url_slug,
	last_price_action_percent_magnitude
}: {
	price_history: Item["price_history"];
	last_price: Item["last_price"];
	url_slug: Item["url_slug"];
	last_price_action_percent_magnitude: Item["last_price_action_percent_magnitude"];
}) {
	const { width } = useWindowDimensions();
	const compact = width < 360;

	const prev = price_history[price_history.length - 2]?.price;
	const [lira, kurus = "00"] = formatPrice(last_price).split(",");

	return (
		<Link
			href={`/indirimler/${url_slug}`}
			asChild
		>
			<Pressable className={compact ? "gap-1" : "flex-row items-end"}>
				{!compact && (
					<>
						<View style={{ width: "30%", minWidth: 78 }}>
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								className="text-destructive font-medium leading-tight line-through"
							>
								{prev ? formatPrice(prev) : "-"}
								<Text className="font-normal">₺</Text>
							</Text>
						</View>

						<View style={{ flex: 1, paddingHorizontal: 10 }}>
							<Text
								numberOfLines={1}
								ellipsizeMode="tail"
								className="text-emerald-600 leading-tight"
							>
								<Text className="text-xl font-bold leading-tight">{lira}</Text>
								<Text className="font-medium leading-tight">
									,{kurus}
									<Text className="font-normal">₺</Text>
								</Text>
							</Text>
						</View>

						<View style={{ width: "15%", minWidth: 48 }}>
							<Text
								numberOfLines={1}
								className="text-lg text-primary font-semibold leading-tight"
							>
								%{Math.round(last_price_action_percent_magnitude)}
							</Text>
						</View>
					</>
				)}

				{compact && (
					<>
						<View className="flex-row items-end">
							<View className="flex-1">
								<Text
									numberOfLines={1}
									ellipsizeMode="tail"
									className="text-emerald-600 leading-tight"
								>
									<Text className="text-xl font-bold leading-tight">{lira}</Text>
									<Text className="font-medium leading-tight">
										,{kurus}
										<Text className="font-normal">₺</Text>
									</Text>
								</Text>
							</View>

							<View className="min-w-[52px] items-end">
								<Text
									numberOfLines={1}
									className="text-lg text-primary font-semibold leading-tight"
								>
									%{Math.round(last_price_action_percent_magnitude)}
								</Text>
							</View>
						</View>

						<Text
							numberOfLines={1}
							ellipsizeMode="tail"
							className="text-destructive font-medium leading-tight line-through"
						>
							{prev ? formatPrice(prev) : "-"}
							<Text className="font-normal">₺</Text>
						</Text>
					</>
				)}
			</Pressable>
		</Link>
	);
}
