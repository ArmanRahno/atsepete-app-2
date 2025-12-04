import Toast from "react-native-toast-message";

const addCategoryListener = async ({
	category,
	isUserSubscribed
}: {
	category: string;
	isUserSubscribed: boolean;
}) => {
	try {
		const response = await fetch(
			"https://atsepete.net/api/application/action/category-listener",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					category,
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

export default addCategoryListener;
