import { lightPrimary } from "@/constants/Colors";
import { BaseToast, ToastProps } from "react-native-toast-message";

const toastConfig = {
	custom: (props: ToastProps) => (
		<BaseToast
			{...props}
			style={{ borderLeftColor: lightPrimary }}
			contentContainerStyle={{ paddingHorizontal: 15 }}
			text1Style={{
				flexWrap: "wrap",
				fontSize: 15,
				fontWeight: "600"
			}}
			text1NumberOfLines={2}
		/>
	)
};

export default toastConfig;
