import { View, Text, Image, Pressable } from "react-native";
import { Card } from "../../shad-cn/card";
import { Link } from "expo-router";
import CheapestBadge from "../CheapestBadge";
import { ClassNameValue } from "tailwind-merge";
import { cn } from "@/lib/utils";
import UrunlerItemCardTopRow from "./UrunlerItemCardTopRow";
import UrunlerItemCardMiddleRow from "./UrunlerItemCardMiddleRow";
import UrunlerItemCardBottomRow from "./UrunlerItemCardBottomRow";

export type ItemCardProps = {
	item: Item;
	className?: ClassNameValue;
	onListenerSuccess?: (itemId: string) => void;
};

export default function UrunlerItemCard({ item, className, onListenerSuccess }: ItemCardProps) {
	return (
		<Card
			className={cn(
				"relative p-3 flex-row gap-6 overflow-hidden rounded-none shadow-none border-none",
				className
			)}
		>
			{item.is_cheapest && <CheapestBadge />}

			<Link
				href={`/urunler/${item.url_slug}`}
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
				<UrunlerItemCardTopRow
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

					<UrunlerItemCardMiddleRow
						last_price={item.last_price}
						url_slug={item.url_slug}
					/>

					<UrunlerItemCardBottomRow
						last_price_action_date_time={item.last_price_action_date_time}
						marketplace={item.marketplace}
						category={item.category}
					/>
				</View>
			</View>
		</Card>
	);
}
