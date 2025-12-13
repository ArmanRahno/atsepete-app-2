import addItemListener from "@/lib/addItemListener";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ActivityIndicator } from "react-native";
import Toast from "react-native-toast-message";
import { ItemCardProps } from "./item-card/ItemCard";
import { BellMinus, BellPlus } from "lucide-react-native";
import { ClassNameValue } from "tailwind-merge";
import AppTouchableOpacity from "../AppTouchableOpacity";
import { useAccountNotificationPermission } from "@/hooks/useAccountNotificationPermission";

const ItemListener = ({
	item,
	className,
	onListenerSuccess
}: ItemCardProps & { className?: ClassNameValue }) => {
	const [isUserSubscribed, setIsUserSubscribed] = useState<boolean>(
		item.is_user_subscribed || false
	);
	const [isListenerPending, setIsListenerPending] = useState<boolean>(false);

	const { askAndStoreAccountPushToken } = useAccountNotificationPermission();

	return (
		<AppTouchableOpacity
			className={cn(
				"px-4 py-2 rounded border border-border disabled:opacity-75 disabled:brightness-75 justify-center items-center",
				isUserSubscribed ? "bg-emerald-500" : "bg-destructive",
				className
			)}
			onPress={async () => {
				try {
					setIsListenerPending(true);

					Toast.hide();

					const data = await addItemListener({ item, isUserSubscribed });

					if (!data) return;

					const { finalState } = data;

					setIsUserSubscribed(finalState);
					Toast.show({
						type: finalState ? "success" : "error",
						text1: data.description,
						topOffset: 45
					});

					await askAndStoreAccountPushToken();

					onListenerSuccess && onListenerSuccess(item._id.toString());
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
					size={20}
					color="#fff"
				/>
			)}
			{!isListenerPending && !isUserSubscribed && (
				<BellPlus
					size={20}
					color="#fff"
				/>
			)}
			{isListenerPending && <ActivityIndicator className="text-white" />}
		</AppTouchableOpacity>
	);
};

export default ItemListener;
