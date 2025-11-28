import { ActivityIndicator, View } from "react-native";

const LoadingIndicator = () => (
	<View className="flex-1 justify-center items-center">
		<ActivityIndicator
			className="text-foreground"
			size="large"
		/>
	</View>
);

export default LoadingIndicator;
