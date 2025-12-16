import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, StyleSheet, Pressable, Alert } from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { lightBorder, lightMutedForeground } from "../constants/Colors";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react-native";
import AppTouchableOpacity from "./AppTouchableOpacity";
import { Dropdown } from "react-native-element-dropdown";

export const SORT_OPTIONS = [
	{ label: "En Yeni", value: "en-yeni" },
	{ label: "En Eski", value: "en-eski" },
	{ label: "En Az İndirim", value: "en-az-indirim" },
	{ label: "En Çok İndirim", value: "en-cok-indirim" },
	{ label: "En Ucuz", value: "en-ucuz" },
	{ label: "En Pahalı", value: "en-pahali" }
];

export type Filters = {
	minPrice?: string;
	maxPrice?: string;
	sort?: string;
};

type FilterAndSortDialogProps = {
	visible: boolean;
	onApply: (params: { minPrice?: string; maxPrice?: string; sort?: string }) => void;
	onClose: () => void;
	onClearFilters: () => void;
	filters: Filters;
};

export default function FilterAndSortDialog(props: FilterAndSortDialogProps) {
	const { visible, onClose, onApply, onClearFilters, filters } = props;

	const [minPrice, setMinPrice] = useState(filters.minPrice || "");
	const [maxPrice, setMaxPrice] = useState(filters.maxPrice || "");
	const [sort, setSort] = useState(filters.sort || "en-yeni");

	// Sync local state with parent's filters when the modal becomes visible
	useEffect(() => {
		if (visible) {
			setMinPrice(filters.minPrice || "");
			setMaxPrice(filters.maxPrice || "");
			setSort(filters.sort || "en-yeni");
		}
	}, [visible, filters]);

	function validateAndApply() {
		const minVal = parseFloat(minPrice) || 0;
		const maxVal = parseFloat(maxPrice) || 0;

		if (minPrice.trim() && maxPrice.trim() && minVal > maxVal) {
			Alert.alert(
				"Geçersiz Fiyat Aralığı",
				`Min. fiyat (${minVal}) max. fiyattan (${maxVal}) fazla olamaz!`
			);
			return;
		}

		onApply({
			minPrice: minPrice.trim() || undefined,
			maxPrice: maxPrice.trim() || undefined,
			sort: sort
		});
		onClose();
	}

	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
			onRequestClose={onClose}
		>
			<Pressable
				className="flex-1 bg-black/40 justify-center items-center"
				onPress={onClose}
			>
				<Pressable
					className="w-4/5 max-w-96 bg-background p-5 rounded-lg gap-4"
					onPress={() => {}}
				>
					<Text className="text-lg text-foreground font-semibold">
						Filtrele ve Sırala
					</Text>

					<View className="gap-1">
						<Text className="font-medium">Sıralama</Text>

						<Dropdown
							data={SORT_OPTIONS}
							labelField="label"
							valueField="value"
							value={sort}
							onChange={(item: any) => setSort(item.value)}
							style={{
								paddingVertical: 8,
								paddingHorizontal: 12,
								borderRadius: 8,
								borderWidth: 1,
								borderColor: lightBorder
							}}
							containerStyle={{ borderRadius: 8, overflow: "hidden", marginTop: -16 }}
						/>

						{/* {SORT_OPTIONS.map(option => (
								<AppTouchableOpacity
									key={option.value}
									onPress={() => setSort(option.value)}
									style={styles.radioRow}
								>
									<View style={styles.radioCircle}>
										{sort === option.value && (
											<View style={styles.radioCircleFilled} />
										)}
									</View>
									<Text style={{ marginLeft: 8 }}>{option.label}</Text>
								<AppTouchableOpacity>
							))} */}
					</View>

					<View className="gap-1">
						<Text className="font-medium">Fiyat Aralığı</Text>
						<View className="flex-row gap-2 items-center">
							<TextInput
								className="flex-1 rounded-lg px-4 py-2 border border-border text-foreground placeholder:text-muted-foreground"
								placeholder="Min."
								keyboardType="numeric"
								value={minPrice}
								onChangeText={setMinPrice}
								numberOfLines={1}
							/>
							<Text>-</Text>
							<TextInput
								className="flex-1 rounded-lg px-4 py-2 border border-border text-foreground placeholder:text-muted-foreground"
								placeholder="Max."
								keyboardType="numeric"
								value={maxPrice}
								onChangeText={setMaxPrice}
								numberOfLines={1}
							/>
						</View>
					</View>

					<View className="gap-2">
						<AppTouchableOpacity
							className="bg-primary rounded-lg px-4 py-2 items-center"
							onPress={validateAndApply}
						>
							<Text className="text-sm font-medium text-primary-foreground">
								Seçenekleri Uygula
							</Text>
						</AppTouchableOpacity>
						<View className="flex-row gap-2">
							<AppTouchableOpacity
								className="flex-1 bg-secondary rounded-lg px-4 py-2 items-center"
								onPress={onClearFilters}
							>
								<Text className="text-sm font-medium text-secondary-foreground">
									Filtreleri Sil
								</Text>
							</AppTouchableOpacity>
							<AppTouchableOpacity
								className="flex-1 bg-secondary rounded-lg px-4 py-2 items-center"
								onPress={onClose}
							>
								<Text className="text-sm font-medium text-secondary-foreground">
									Kapat
								</Text>
							</AppTouchableOpacity>
						</View>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
}

const styles = StyleSheet.create({
	dropdown: { padding: 8, borderRadius: 8 }
});
