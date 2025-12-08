import { useState } from "react";
import { Copy, CopyCheck } from "lucide-react-native";
import { ClassNameValue } from "tailwind-merge";
import { cn } from "@/lib/utils";
import { TouchableOpacity } from "react-native";
import { Text } from "react-native";
import * as Clipboard from "expo-clipboard";
import AppTouchableOpacity from "./AppTouchableOpacity";

const CopyBtn = ({
	copyVal,
	btnClassName,
	size = 24
}: {
	copyVal?: string;
	btnClassName?: ClassNameValue;
	size?: number;
}) => {
	const [hasCopied, setHasCopied] = useState<boolean>(false);

	return (
		<AppTouchableOpacity
			className={cn(
				"px-2 py-2 h-9 rounded border border-border justify-center items-center",
				btnClassName
			)}
			onPress={async () => {
				await Clipboard.setStringAsync(copyVal ?? "");
				setHasCopied(true);

				setTimeout(() => {
					setHasCopied(false);
				}, 2000);
			}}
		>
			<Text>
				{hasCopied ? (
					<CopyCheck
						color="#059669"
						size={size}
					/>
				) : (
					<Copy size={size} />
				)}
			</Text>
		</AppTouchableOpacity>
	);
};

export default CopyBtn;
