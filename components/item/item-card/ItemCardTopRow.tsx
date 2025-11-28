import { Link } from "expo-router";
import { View, Pressable, Text } from "react-native";
import ItemListener from "../ItemListener";
import { ClassNameValue } from "tailwind-merge";

const ItemCardTopRow = ({
	item,
	className,
	onListenerSuccess
}: {
	item: Item;
	className?: ClassNameValue;
	onListenerSuccess: ((itemId: string) => void) | undefined;
}) => {
	return (
		<Link
			href={`/indirimler/${item.url_slug}`}
			asChild
		>
			<Pressable className={`relative flex-row justify-between ${className}`}>
				<Text className="font-medium text-base text-blue-600 leading-tight text-wrap pr-16">
					{item.name}
				</Text>

				<View className="absolute top-0 right-0 gap-1">
					<ItemListener
						item={item}
						onListenerSuccess={onListenerSuccess}
					/>
				</View>
			</Pressable>
		</Link>
	);
};

export default ItemCardTopRow;
