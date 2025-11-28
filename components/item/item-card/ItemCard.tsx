import { View, Text, Image, Pressable } from "react-native";
import { Card } from "../../shad-cn/card";
import { Link } from "expo-router";
import CheapestBadge from "../CheapestBadge";
import { ClassNameValue } from "tailwind-merge";
import { cn } from "@/lib/utils";
import ItemCardBottomRow from "./ItemCardBottomRow";
import ItemCardMiddleRow from "./ItemCardMiddleRow";
import ItemCardTopRow from "./ItemCardTopRow";

export type ItemCardProps = {
	item: Item;
	className?: ClassNameValue;
	onListenerSuccess?: (itemId: string) => void;
};

export default function ItemCard({ item, className, onListenerSuccess }: ItemCardProps) {
	return (
		<Card
			className={cn(
				"relative p-3 flex-row gap-6 overflow-hidden rounded-none shadow-none border-none",
				className
			)}
		>
			{item.is_cheapest && <CheapestBadge />}

			<Link
				href={`/indirimler/${item.url_slug}`}
				asChild
			>
				<Pressable>
					<Image
						source={{ uri: item.image_link }}
						className="w-28 h-28"
						resizeMode="contain"
					/>
				</Pressable>
			</Link>

			<View className="flex-1 flex-col justify-between">
				<ItemCardTopRow
					className="pb-5"
					item={item}
					onListenerSuccess={onListenerSuccess}
				/>

				<View className="gap-1.5">
					{item.is_discount_unavailable && (
						<Text className="text-xs font-semibold text-red-500">
							{item.discount_unavailability_cause || "İndirim artık devam etmiyor!"}
						</Text>
					)}

					<ItemCardMiddleRow
						last_price={item.last_price}
						price_history={item.price_history}
						url_slug={item.url_slug}
						last_price_action_percent_magnitude={
							item.last_price_action_percent_magnitude
						}
					/>

					<ItemCardBottomRow
						last_price_action_date_time={item.last_price_action_date_time}
						marketplace={item.marketplace}
						category={item.category}
					/>
				</View>
			</View>
		</Card>
	);
}
