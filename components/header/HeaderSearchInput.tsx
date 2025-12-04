import { lightMutedForeground } from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Keyboard, Text, TextInput, TouchableOpacity, View } from "react-native";
import BarcodeScanButton from "../barcode-scan/BarcodeScanButton";

const endpoint = "https://atsepete.net/api/application/action/search-suggestion";

const HeaderSearchInput = () => {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<{ name: string; url_slug: string }[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	useEffect(() => {
		const keyboardDidHideListener = Keyboard.addListener("keyboardDidHide", () => {
			setShowSuggestions(false);
		});
		return () => {
			keyboardDidHideListener.remove();
		};
	}, []);

	const handleSubmit = () => {
		if (query.trim().length > 0) {
			router.push(`/(tabs)/ara/${encodeURIComponent(query)}`);
			setShowSuggestions(false);
			setSuggestions([]);
			Keyboard.dismiss();
		}
	};

	const handleChangeText = async (text: string) => {
		setQuery(text);
		setShowSuggestions(false);
		if (text.trim().length < 2) {
			setSuggestions([]);
			setShowSuggestions(false);
			return;
		}

		try {
			const userId = await AsyncStorage.getItem("userId");

			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ search: text, userId: userId || "APPLICATION" })
			});

			if (!response.ok) {
				return;
				// throw new Error("Network error");
			}

			const data = await response.json();

			if (data && data.result) {
				setSuggestions(data.result);
				setShowSuggestions(true);
			} else {
				setSuggestions([]);
				setShowSuggestions(false);
			}
		} catch (err) {
			console.error("Fetch suggestions error:", err);
			setSuggestions([]);
			setShowSuggestions(false);
		}
	};

	const handleSuggestionPress = (suggestion: { name: string; url_slug: string }) => {
		router.push(`/urunler/${suggestion.url_slug}`, { withAnchor: true });
		setShowSuggestions(false);
		setSuggestions([]);
		setQuery("");
		Keyboard.dismiss();
	};

	return (
		<View className="flex-row relative flex-1 items-center border border-border rounded-xl">
			<Text className="mx-1 p-2">
				<Search
					size={20}
					color={lightMutedForeground}
				/>
			</Text>
			<TextInput
				className="flex-1 p-0 text-foreground placeholder:text-muted-foreground"
				placeholder="Ara"
				autoCapitalize="none"
				value={query}
				onChangeText={handleChangeText}
				onSubmitEditing={handleSubmit}
				onFocus={() => {
					if (suggestions.length > 0) {
						setShowSuggestions(true);
					}
				}}
				onBlur={() => {
					setShowSuggestions(false);
				}}
			/>
			<BarcodeScanButton />
			{showSuggestions && suggestions.length > 0 && (
				<View className="absolute top-[210%] left-0 right-0 bg-background border border-border rounded-lg z-[3]">
					{suggestions.slice(0, 5).map(suggestion => {
						return (
							<TouchableOpacity
								key={suggestion.url_slug}
								onPress={() => handleSuggestionPress(suggestion)}
								className="px-2 py-2 border-b border-gray-200"
							>
								<Text
									numberOfLines={1}
									className="text-gray-800"
								>
									{suggestion.name}
								</Text>
							</TouchableOpacity>
						);
					})}
				</View>
			)}
		</View>
	);
};

export default HeaderSearchInput;
