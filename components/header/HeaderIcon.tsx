import { Pressable, View } from "react-native";
import AtSepeteIcon from "@/assets/icons/AtSepeteIcon";
import { useRouter } from "expo-router";
import HeaderBrandText from "./HeaderBrandText";

const HeaderIcon = () => {
	const router = useRouter();

	const handlePress = () => {
		router.replace("/");
	};

	return (
		<Pressable
			onPress={handlePress}
			hitSlop={8}
			accessibilityRole="button"
			accessibilityLabel="Ana sayfaya git"
			style={{
				alignSelf: "center",
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "center",
				gap: 8,
				flexShrink: 0,
				overflow: "visible"
			}}
		>
			<View className="rounded-full bg-primary/10 p-1">
				<View
					className="bg-primary justify-center items-center rounded-full"
					style={{ height: 24, width: 24 }}
				>
					<AtSepeteIcon
						height={15}
						width={15}
						fill="white"
						stroke="white"
						strokeWidth={4}
					/>
				</View>
			</View>

			<HeaderBrandText />
		</Pressable>
	);
};

export default HeaderIcon;
