import React, { memo } from "react";
import { FlatList, Text, View } from "react-native";
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
				const isFirst = index === 0;
				const isLast = index === items.length - 1;

				const rounding = [isFirst ? "rounded-t-lg" : "", isLast ? "rounded-b-lg" : ""]
					.filter(Boolean)
					.join(" ");

				if (item.isDiscount) {
					if (!isFirst && !isLast) {
						return (
							<MemoizedItemCard
								key={item._id.toString()}
								item={item}
								onListenerSuccess={onListenerSuccess}
							/>
						);
					}

					return (
						<View
							key={item._id.toString()}
							className={["border border-border", rounding].join(" ")}
						>
							<View className={["overflow-hidden", rounding].join(" ")}>
								<MemoizedItemCard
									item={item}
									onListenerSuccess={onListenerSuccess}
									className="border-0"
								/>
							</View>
						</View>
					);
				}

				if (!isFirst && !isLast) {
					return (
						<MemoizedUrunlerItemCard
							key={item._id.toString()}
							item={item}
							onListenerSuccess={onListenerSuccess}
						/>
					);
				}

				return (
					<View
						key={item._id.toString()}
						className={["border border-border", rounding].join(" ")}
					>
						<View className={["overflow-hidden", rounding].join(" ")}>
							<MemoizedUrunlerItemCard
								item={item}
								onListenerSuccess={onListenerSuccess}
								className="border-0"
							/>
						</View>
					</View>
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
