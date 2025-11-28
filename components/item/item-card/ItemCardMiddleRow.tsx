import formatPrice from "@/lib/formatPrice";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

const ItemCardMiddleRow = ({
	price_history,
	last_price,
	url_slug,
	last_price_action_percent_magnitude
}: {
	price_history: Item["price_history"];
	last_price: Item["last_price"];
	url_slug: Item["url_slug"];
	last_price_action_percent_magnitude: Item["last_price_action_percent_magnitude"];
}) => {
	return (
		<Link
			href={`/indirimler/${url_slug}`}
			asChild
		>
			<Pressable className="flex-row gap-2.5 items-baseline">
				<Text className="text-destructive font-medium leading-tight line-through">
					{formatPrice(price_history[price_history.length - 2].price)}
					<Text className="font-normal">₺</Text>
				</Text>

				<Text className="text-emerald-600 leading-tight">
					<Text className="text-2xl font-bold leading-tight">
						{formatPrice(last_price).split(",")[0]}
					</Text>

					<Text className="font-medium leading-tight">
						,{formatPrice(last_price).split(",")[1]}
						<Text className="font-normal">₺</Text>
					</Text>
				</Text>

				<Text className="text-lg text-primary font-semibold leading-tight">
					%{Math.round(last_price_action_percent_magnitude)}
				</Text>
			</Pressable>
		</Link>
	);
};

export default ItemCardMiddleRow;
