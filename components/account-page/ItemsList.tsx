import React, { memo } from "react";
import { FlatList, Text } from "react-native";
import ItemCard from "@/components/item/item-card/ItemCard";
import UrunlerItemCard from "../item/item-card/UrunlerItemCard";

type ItemsListProps = {
	items: Item[];
	onListenerSuccess: (itemId: string) => void;
};

const MemoizedItemCard = memo(ItemCard);
const MemoizedUrunlerItemCard = memo(UrunlerItemCard);

export default function ItemsList({ items, onListenerSuccess }: ItemsListProps) {
	return (
		<FlatList
			data={items}
			keyExtractor={item => item._id.toString()}
			renderItem={({ item, index }) => {
				if (item.isDiscount)
					return (
						<MemoizedItemCard
							className={
								index === 0
									? "rounded-t-lg"
									: index === items.length - 1
									? "rounded-b-lg"
									: ""
							}
							key={item._id.toString()}
							item={item}
							onListenerSuccess={onListenerSuccess}
						/>
					);

				return (
					<MemoizedUrunlerItemCard
						className={
							index === 0
								? "rounded-t-lg"
								: index === items.length - 1
								? "rounded-b-lg"
								: ""
						}
						key={item._id.toString()}
						item={item}
						onListenerSuccess={onListenerSuccess}
					/>
				);
			}}
			ListEmptyComponent={
				<Text className="text-destructive text-center mt-6 text-lg font-bold">
					Alarm eklediğiniz ürün bulunmamaktadır.
				</Text>
			}
			className="p-2"
			contentContainerClassName="pb-4"
		/>
	);
}
