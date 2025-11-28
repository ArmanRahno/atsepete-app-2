import React, { useState, useEffect } from "react";
import {
	Modal,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Pressable,
	Alert
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import { lightMutedForeground } from "../constants/Colors";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react-native";

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

						<SelectDropdown
							data={SORT_OPTIONS}
							dropdownStyle={styles.dropdown}
							onSelect={option => setSort(option.value)}
							defaultValue={sort}
							renderButton={() => (
								<TouchableOpacity className="flex-row justify-between rounded-lg px-4 py-2 border border-border">
									<Text style={{ fontFamily: "Roboto_500Medium" }}>
										{SORT_OPTIONS.find(opt => opt.value === sort)?.label}
									</Text>
									<ChevronDown
										size={20}
										color={lightMutedForeground}
									/>
								</TouchableOpacity>
							)}
							renderItem={option => (
								<View
									className={cn(
										"px-2 py-1 my-0.5 rounded-[6px]",
										option.value === sort ? "bg-gray-300" : ""
									)}
								>
									<Text>{option.label}</Text>
								</View>
							)}
						/>
						{/* {SORT_OPTIONS.map(option => (
								<TouchableOpacity
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
								</TouchableOpacity>
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
						<TouchableOpacity
							className="bg-primary rounded-lg px-4 py-2 items-center"
							onPress={validateAndApply}
						>
							<Text className="text-sm font-medium text-primary-foreground">
								Seçenekleri Uygula
							</Text>
						</TouchableOpacity>
						<View className="flex-row gap-2">
							<TouchableOpacity
								className="flex-1 bg-secondary rounded-lg px-4 py-2 items-center"
								onPress={onClearFilters}
							>
								<Text className="text-sm font-medium text-secondary-foreground">
									Filtreleri Sil
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								className="flex-1 bg-secondary rounded-lg px-4 py-2 items-center"
								onPress={onClose}
							>
								<Text className="text-sm font-medium text-secondary-foreground">
									Kapat
								</Text>
							</TouchableOpacity>
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
