import { AlertTriangle, CheckCircle } from "lucide-react-native";
import { View, Text } from "react-native";

export type FormInformProps = {
	message?: string;
	status: "error" | "success" | null;
};

const FormInForm = ({ status, message }: FormInformProps) => {
	if (!status) return null;

	const bg = status === "success" ? "bg-emerald-600/10" : "bg-destructive/10";
	const fg = status === "success" ? "text-emerald-600" : "text-destructive";

	return (
		<View className={`flex-row items-center gap-4 px-4 py-3 rounded-lg ${bg}`}>
			{status === "error" && (
				<AlertTriangle
					size={20}
					color="#ef4444"
				/>
			)}
			{status === "success" && (
				<CheckCircle
					size={20}
					color="#059669"
				/>
			)}
			<Text className={`flex-1 text-sm font-medium ${fg}`}>{message}</Text>
		</View>
	);
};

export default FormInForm;
