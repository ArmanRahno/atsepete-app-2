import { cn } from "@/lib/utils";
import { useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";
import { BellMinus, BellPlus } from "lucide-react-native";
import { ClassNameValue } from "tailwind-merge";
import addCategoryListener from "@/lib/addCategoryListener";

const CategoryListener = ({
	is_user_subscribed,
	category,
	className,
	size = 20,
	onListenerSuccess
}: {
	is_user_subscribed: boolean | undefined | null;
	category: Item["category"];
	className?: ClassNameValue;
	size?: number;
	onListenerSuccess?: () => void;
}) => {
	const [isUserSubscribed, setIsUserSubscribed] = useState<boolean>(is_user_subscribed || false);
	const [isListenerPending, setIsListenerPending] = useState<boolean>(false);

	return (
		<TouchableOpacity
			className={cn(
				"px-4 py-1 rounded border border-border disabled:opacity-75 disabled:brightness-75 justify-center items-center",
				isUserSubscribed ? "bg-emerald-500" : "bg-destructive",
				className
			)}
			onPress={async () => {
				try {
					setIsListenerPending(true);

					Toast.hide();

					const data = await addCategoryListener({ category, isUserSubscribed });

					if (!data) return;

					const { finalState } = data;

					setIsUserSubscribed(finalState);
					Toast.show({
						type: finalState ? "success" : "error",
						text1: data.description,
						topOffset: 60
					});

					onListenerSuccess && onListenerSuccess();
				} catch (err) {
					console.error(err);
				} finally {
					setIsListenerPending(false);
				}
			}}
			disabled={isListenerPending}
		>
			{!isListenerPending && isUserSubscribed && (
				<BellMinus
					size={size}
					color="#fff"
				/>
			)}
			{!isListenerPending && !isUserSubscribed && (
				<BellPlus
					size={size}
					color="#fff"
				/>
			)}
			{isListenerPending && (
				<ActivityIndicator
					className="text-white"
					size={size}
				/>
			)}
		</TouchableOpacity>
	);
};

export default CategoryListener;
