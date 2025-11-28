// import { useCallback, useEffect } from "react";
// import { useLastNotificationResponse, clearLastNotificationResponse } from "expo-notifications";
// import { useRouter, useRootNavigationState } from "expo-router";
// import { pathFromPayload } from "@/lib/navFromNotification";

// const NotificationColdStartNav = () => {
// 	const router = useRouter();
// 	const nav = useRootNavigationState();
// 	const last = useLastNotificationResponse();

// 	const buildPath = useCallback((route: unknown, slug?: unknown) => {
// 		if (typeof route !== "string") return null;

// 		const base = "/" + route.split("/").filter(Boolean).join("/");

// 		if (typeof slug === "string" && slug.trim()) {
// 			const cleanSlug = slug.split("/").filter(Boolean).join("/");
// 			return `${base}/${cleanSlug}`;
// 		}

// 		return base;
// 	}, []);

// 	useEffect(() => {
// 		const notificationLogic = async () => {
// 			if (!nav.key || !last) return;

// 			// const data = last.notification.request?.content?.data;

// 			// if (data?.type === "NAVIGATE") {
// 			// 	const path = buildPath(data.route, data.slug);

// 			// 	if (path) {
// 			// 		// @ts-expect-error runtime string
// 			// 		router.push(path);

// 			// 		await clearLastNotificationResponseAsync();
// 			// 	}
// 			// }

// 			const data = last.notification.request?.content?.data;
// 			if (data && typeof data === "object" && (data as any).type === "NAVIGATE") {
// 				const path = pathFromPayload(data as any);
// 				if (path) router.push(path as any);

// 				await clearLastNotificationResponse();
// 			}
// 		};

// 		notificationLogic();
// 	}, [nav.key, last]);

// 	return null;
// };

// export default NotificationColdStartNav;

import { useEffect } from "react";
import { useLastNotificationResponse, clearLastNotificationResponse } from "expo-notifications";
import { useRouter, useRootNavigationState } from "expo-router";
import { pathFromPayload } from "@/lib/navFromNotification";

const NotificationColdStartNav = () => {
	const router = useRouter();
	const nav = useRootNavigationState();
	const last = useLastNotificationResponse();

	useEffect(() => {
		const notificationLogic = () => {
			if (!nav.key || !last) return;

			const data = last.notification.request?.content?.data;
			if (!data || typeof data !== "object") return;

			const payload = data as any;

			if (payload.type === "NAVIGATE") {
				const path = pathFromPayload(payload);
				if (path) {
					router.push(path as any);
				}

				clearLastNotificationResponse();
				return;
			}

			if (payload.type === "OPEN_WEBVIEW") {
				const url = payload.url;

				if (typeof url === "string" && url.trim()) {
					router.push({
						pathname: "/webview",
						params: { url }
					} as any);
				}

				clearLastNotificationResponse();
				return;
			}
		};

		notificationLogic();
	}, [nav.key, last, router]);

	return null;
};

export default NotificationColdStartNav;
