import React, { memo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import ItemCard from "@/components/item/item-card/ItemCard";

type ItemsListProps = {
	items: Item[];
	onListenerSuccess: (itemId: string) => void;
};

const MemoizedItemCard = memo(ItemCard);

export default function ItemsList({ items, onListenerSuccess }: ItemsListProps) {
	return (
		<FlatList
			data={items}
			keyExtractor={item => item._id.toString()}
			renderItem={({ item, index }) => {
				if (item.isDiscount) {
					return (
						<MemoizedItemCard
							key={item._id.toString()}
							item={item}
							onListenerTrigger={onListenerSuccess}
						/>
					);
				}

				return (
					<MemoizedItemCard
						key={item._id.toString()}
						item={item}
						onListenerTrigger={onListenerSuccess}
						detailHrefPrefix="/urunler"
					/>
				);
			}}
			ItemSeparatorComponent={() => <View className="h-2" />}
			ListEmptyComponent={
				<Text className="text-destructive text-center mt-6 text-lg font-bold">
					Alarm eklediğiniz ürün bulunmamaktadır.
				</Text>
			}
			contentContainerStyle={styles.listContent}
		/>
	);
}

const styles = StyleSheet.create({
	listContent: {
		paddingHorizontal: 8,
		paddingTop: 8,
		paddingBottom: 24
	}
});
