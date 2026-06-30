import Header from "@/components/header/Header";
import { Stack, useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useState } from "react";
import { Keyboard, Text, TextInput, View } from "react-native";
import HeaderIcon from "@/components/header/HeaderIcon";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import { useThemePalette } from "@/hooks/useThemePalette";

const endpoint = "https://atsepete.net/api/application/action/search-suggestion";

export default function SearchPageLayout() {
	const router = useRouter();
	const { colors } = useThemePalette();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<{ name: string; url_slug: string }[]>([]);
	const [showSuggestions, setShowSuggestions] = useState(false);

	const handleSubmit = () => {
		if (query.trim().length > 0) {
			router.push(`/ara/${encodeURIComponent(query)}`);
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
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ search: text, userId: "APPLICATION" })
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
		router.push(`/ara/urunler/${suggestion.url_slug}`);
		setShowSuggestions(false);
		setSuggestions([]);
		setQuery("");
		Keyboard.dismiss();
	};

	return (
		<>
			<Header>
				<HeaderIcon />

				<View className="flex-row gap-2">
					<View className="relative flex-1">
						<TextInput
							className="flex-1 border border-border p-2 rounded-xl text-foreground placeholder:text-muted-foreground"
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
						{showSuggestions && suggestions.length > 0 && (
							<View className="absolute top-[110%] left-0 right-0 bg-background border border-border rounded-lg z-[3]">
								{suggestions.slice(0, 5).map(suggestion => {
									return (
										<AppTouchableOpacity
											key={suggestion.url_slug}
											onPress={() => handleSuggestionPress(suggestion)}
											className="px-2 py-2 border-b border-border"
										>
											<Text
												numberOfLines={1}
												className="text-foreground"
											>
												{suggestion.name}
											</Text>
										</AppTouchableOpacity>
									);
								})}
							</View>
						)}
					</View>
					<AppTouchableOpacity
						className="border border-border p-2 rounded-xl"
						onPress={handleSubmit}
					>
						<Search
							size={20}
							color={colors.mutedForeground}
						/>
					</AppTouchableOpacity>
				</View>
			</Header>
			<Stack
				screenOptions={{
					headerShown: false,
					gestureEnabled: true,
					fullScreenGestureEnabled: true
				}}
			/>
		</>
	);
}
