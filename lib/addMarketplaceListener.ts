import Toast from "react-native-toast-message";

const addMarketplaceListener = async ({
	marketplace,
	isUserSubscribed
}: {
	marketplace: string;
	isUserSubscribed: boolean;
}) => {
	try {
		const response = await fetch(
			"https://atsepete-rework-6vep9h2qp-armans-projects-2ebbfea8.vercel.app/api/application/action/marketplace-listener",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					marketplace,
					activateListener: !isUserSubscribed
				})
			}
		);

		const data = await response.json();

		if (data.action && data.action === "LOGIN") {
			Toast.show({
				type: "custom",
				text1: data.description,
				topOffset: 60
			});

			return null;
		}

		if (!response.ok || typeof data.finalState === "undefined") {
			Toast.show({
				type: "error",
				text1: "Bir hata oluştu",
				topOffset: 60
			});

			return null;
		}

		const { finalState } = data;

		Toast.show({
			type: finalState ? "success" : "error",
			text1: data.description,
			topOffset: 60
		});

		return data;
	} catch (e) {
		console.log(e);
	}
};

export default addMarketplaceListener;
