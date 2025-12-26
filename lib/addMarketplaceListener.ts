export type AddMarketplaceListenerResponse =
	| { ok: true; finalState: boolean; description: string }
	| { ok: false; reason: "LOGIN"; description: string }
	| { ok: false; reason: "ERROR"; description: string };

const addMarketplaceListener = async ({
	marketplace,
	isUserSubscribed
}: {
	marketplace: string;
	isUserSubscribed: boolean;
}): Promise<AddMarketplaceListenerResponse> => {
	try {
		const response = await fetch(
			"https://atsepete.net/api/application/action/marketplace-listener",
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

		const data = await response.json().catch(() => null);

		if (data?.action === "LOGIN") {
			return {
				ok: false,
				reason: "LOGIN",
				description:
					data?.description ??
					"Fiyat bildirimi eklemeniz için giriş yapmanız gerekmektedir."
			};
		}

		if (response.ok && typeof data?.finalState !== "undefined") {
			return {
				ok: true,
				finalState: Boolean(data.finalState),
				description: data?.description ?? "İşlem başarılı."
			};
		}

		return {
			ok: false,
			reason: "ERROR",
			description: data?.description ?? data?.message ?? "Bir hata oluştu"
		};
	} catch {
		return { ok: false, reason: "ERROR", description: "Bir hata oluştu" };
	}
};

export default addMarketplaceListener;
