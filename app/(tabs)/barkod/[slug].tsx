import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback, memo, useRef } from "react";
import {
	FlatList,
	ActivityIndicator,
	View,
	NativeSyntheticEvent,
	NativeScrollEvent,
	TouchableOpacity
} from "react-native";
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { Text } from "react-native";
import { ChevronUp } from "lucide-react-native";
import UrunlerItemCard from "@/components/item/item-card/UrunlerItemCard";

const API_URL = "https://atsepete.net/api/application/page/barcode";

type UrunlerPageData = {
	items: Item[];
	message?: string;
};

const MemoizedItemCard = memo(UrunlerItemCard);

export default function BarkodScreen() {
	const { slug } = useLocalSearchParams();
	const [items, setItems] = useState<Item[]>([]);

	const [loading, setLoading] = useState<boolean>(false);
	const [serverMessage, setServerMessage] = useState<string | null>(null);

	const [displayBackToTopBtn, setDisplayBackToTopBtn] = useState<boolean>(false);
	const flatListRef = useRef<FlatList<Item>>(null);

	const fetchItems = useCallback(async () => {
		try {
			setServerMessage(null);
			setLoading(true);

			const response = await fetch(API_URL, {
				method: "POST",
				body: JSON.stringify({ barcode: slug })
			});

			const data: UrunlerPageData = await response.json();

			if (!response.ok) {
				setServerMessage(data.message ?? "Barkodla eşleşen ürün bulunamadı.");
			}

			setItems(data.items);
		} catch (error) {
			console.error("Error fetching urunler items:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			setDisplayBackToTopBtn(false);

			const asyncCallback = async () => {
				await fetchItems();
			};

			asyncCallback();
		}, [fetchItems])
	);

	const handleScroll = useCallback((val: NativeSyntheticEvent<NativeScrollEvent>) => {
		const isThresholdMet = val.nativeEvent.contentOffset.y > 800;
		setDisplayBackToTopBtn(isThresholdMet);
	}, []);

	const handleScrollToTop = useCallback(() => {
		flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
	}, []);

	return (
		<>
			<Header>
				<HeaderIcon />
				<HeaderSecondRow displaySortTouchable={false} />
			</Header>

			{loading && <LoadingIndicator />}

			{!loading && (
				<FlatList
					ref={flatListRef}
					data={items}
					onScroll={handleScroll}
					scrollEventThrottle={32}
					ListHeaderComponent={
						<>
							<HeaderText className="mt-2 mb-4">Barkod: {slug}</HeaderText>
							{serverMessage && (
								<Text
									className="text-destructive text-lg text-center p-4"
									style={{ fontFamily: "Roboto_500Medium" }}
								>
									{serverMessage}
								</Text>
							)}
						</>
					}
					keyExtractor={item => item._id.toString()}
					renderItem={({ item, index }) => (
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
						/>
					)}
					ListFooterComponent={<View className="py-2" />}
					onEndReachedThreshold={1.5}
					className="p-2"
				/>
			)}

			{displayBackToTopBtn && (
				<TouchableOpacity
					className="absolute bottom-4 right-4 bg-background p-2 border border-border rounded-lg"
					onPress={handleScrollToTop}
				>
					<Text>
						<ChevronUp />
					</Text>
				</TouchableOpacity>
			)}
		</>
	);
}
