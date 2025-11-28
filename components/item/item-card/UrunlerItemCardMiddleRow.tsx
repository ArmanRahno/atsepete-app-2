import formatPrice from "@/lib/formatPrice";
import { Link } from "expo-router";
import { Pressable, Text, View } from "react-native";

const UrunlerItemCardMiddleRow = ({
	last_price,
	url_slug
}: {
	last_price: Item["last_price"];
	url_slug: Item["url_slug"];
}) => {
	return (
		<Link
			href={`/urunler/${url_slug}`}
			asChild
		>
			<Pressable className="flex-row gap-2.5 items-baseline">
				<Text className="text-foreground leading-tight">
					<Text className="text-2xl font-bold leading-tight">
						{formatPrice(last_price).split(",")[0]}
					</Text>
					<Text className="font-medium leading-tight">
						,{formatPrice(last_price).split(",")[1]}
						<Text className="font-normal">₺</Text>
					</Text>
				</Text>
			</Pressable>
		</Link>
	);
};

export default UrunlerItemCardMiddleRow;
