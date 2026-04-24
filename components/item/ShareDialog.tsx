import { Pressable, Share as RNShare } from "react-native";
import { Share } from "lucide-react-native";
import { Platform } from "react-native";
import { cn } from "@/lib/utils";
import { ClassNameValue } from "tailwind-merge";

interface ShareDialogProps {
	shareUrl: string;
	shareMessage: string;
	pressableClassName?: ClassNameValue;
	iconSize?: number;
}

const ShareDialog = ({
	shareUrl,
	shareMessage,
	pressableClassName,
	iconSize
}: ShareDialogProps) => {
	const nativeShare = async () => {
		const content =
			Platform.OS === "ios"
				? { message: shareMessage, url: shareUrl }
				: { message: `${shareMessage}\n\n${shareUrl}` };

		try {
			await RNShare.share(content);
		} catch (err) {
			console.log("Error sharing:", err);
		}
	};

	return (
		<>
			<Pressable
				className={cn(
					"px-6 py-2 h-9 rounded-xl border border-border justify-center items-center",
					pressableClassName
				)}
				onPress={nativeShare}
			>
				<Share
					size={iconSize ?? 20}
					color="#000"
				/>
			</Pressable>
		</>
	);
};

export default ShareDialog;
