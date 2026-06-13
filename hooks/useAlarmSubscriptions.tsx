import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
	createContext,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from "react";

const REFERRER_CODE_KEY = "user-referrer-code";
const USER_PAGE_URL = "https://atsepete.net/api/application/page/user-page";

export type SharedUserPageData = {
	status: "success" | "error";
	items: Item[];
	categories: string[];
	marketplaces: string[];
	referrer_code?: string;
};

type UserPageResponse =
	| {
			status: "success" | "error";
			code: "LOGIN_REQUIRED" | string;
			items?: undefined;
			categories?: undefined;
			marketplaces?: undefined;
			referrer_code?: undefined;
			message?: undefined;
	  }
	| {
			status: "success" | "error";
			items: Item[];
			categories: string[];
			marketplaces: string[];
			referrer_code?: string;
			code?: undefined;
			message?: undefined;
	  }
	| {
			status: "success" | "error";
			message: string;
			code?: undefined;
			items?: undefined;
			categories?: undefined;
			marketplaces?: undefined;
			referrer_code?: undefined;
	  };

type AlarmSubscriptionsContextValue = {
	isLoggedIn: boolean;
	loading: boolean;
	userPage: SharedUserPageData | null;
	isItemSubscribed: (itemId: string) => boolean | undefined;
	isCategorySubscribed: (category: string) => boolean;
	isMarketplaceSubscribed: (marketplace: string) => boolean;
	setCategorySubscribed: (category: string, active: boolean) => void;
	setMarketplaceSubscribed: (marketplace: string, active: boolean) => void;
	setItemSubscribed: (item: Item, active: boolean) => void;
	removeItemSubscription: (itemId: string) => void;
	refreshUserPage: () => Promise<void>;
};

const AlarmSubscriptionsContext = createContext<AlarmSubscriptionsContextValue | null>(null);

function normalizeUserPage(data: UserPageResponse): SharedUserPageData | null {
	if (data.status === "error" || data.code === "LOGIN_REQUIRED") return null;
	if (!("items" in data) || !data.items) return null;

	return {
		status: data.status,
		items: [...data.items].reverse().map(item => ({ ...item, is_user_subscribed: true })),
		categories: [...(data.categories ?? [])].reverse(),
		marketplaces: [...(data.marketplaces ?? [])].reverse(),
		referrer_code: data.referrer_code
	};
}

export function AlarmSubscriptionsProvider({ children }: { children: ReactNode }) {
	const [userPage, setUserPage] = useState<SharedUserPageData | null>(null);
	const [loading, setLoading] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);

	const loadUserPage = useCallback(async (isActive: () => boolean = () => true) => {
		try {
			setLoading(true);

			const token = await AsyncStorage.getItem("user-session-token");
			if (!token) {
				await AsyncStorage.removeItem(REFERRER_CODE_KEY);
				if (!isActive()) return;
				setIsLoggedIn(false);
				setUserPage(null);
				return;
			}

			const response = await fetch(USER_PAGE_URL);
			if (!response.ok) throw new Error("Error fetching user page");

			const data = (await response.json()) as UserPageResponse;
			const normalized = normalizeUserPage(data);

			if (!isActive()) return;

			if (!normalized) {
				await AsyncStorage.removeItem(REFERRER_CODE_KEY);
				setIsLoggedIn(false);
				setUserPage(null);
				return;
			}

			if (normalized.referrer_code) {
				await AsyncStorage.setItem(REFERRER_CODE_KEY, normalized.referrer_code);
			} else {
				await AsyncStorage.removeItem(REFERRER_CODE_KEY);
			}

			setIsLoggedIn(true);
			setUserPage(normalized);
		} catch (error) {
			console.error("Error fetching user data:", error);
			if (!isActive()) return;
			setIsLoggedIn(false);
			setUserPage(null);
		} finally {
			if (isActive()) setLoading(false);
		}
	}, []);

	const refreshUserPage = useCallback(() => loadUserPage(), [loadUserPage]);

	useEffect(() => {
		let isMounted = true;

		void loadUserPage(() => isMounted);

		return () => {
			isMounted = false;
		};
	}, [loadUserPage]);

	const setCategorySubscribed = useCallback((category: string, active: boolean) => {
		setUserPage(prev => {
			if (!prev) return prev;

			const categories = prev.categories.filter(item => item !== category);

			return {
				...prev,
				categories: active ? [category, ...categories] : categories
			};
		});
	}, []);

	const setMarketplaceSubscribed = useCallback((marketplace: string, active: boolean) => {
		setUserPage(prev => {
			if (!prev) return prev;

			const marketplaces = prev.marketplaces.filter(item => item !== marketplace);

			return {
				...prev,
				marketplaces: active ? [marketplace, ...marketplaces] : marketplaces
			};
		});
	}, []);

	const setItemSubscribed = useCallback((item: Item, active: boolean) => {
		setUserPage(prev => {
			if (!prev) return prev;

			const itemId = item._id.toString();
			const items = prev.items.filter(prevItem => prevItem._id.toString() !== itemId);

			return {
				...prev,
				items: active ? [{ ...item, is_user_subscribed: true }, ...items] : items
			};
		});
	}, []);

	const removeItemSubscription = useCallback((itemId: string) => {
		setUserPage(prev => {
			if (!prev) return prev;
			return {
				...prev,
				items: prev.items.filter(item => item._id.toString() !== itemId)
			};
		});
	}, []);

	const value = useMemo<AlarmSubscriptionsContextValue>(
		() => ({
			isLoggedIn,
			loading,
			userPage,
			isItemSubscribed: itemId =>
				userPage
					? userPage.items.some(item => item._id.toString() === itemId)
					: undefined,
			isCategorySubscribed: category => !!userPage?.categories.includes(category),
			isMarketplaceSubscribed: marketplace => !!userPage?.marketplaces.includes(marketplace),
			setCategorySubscribed,
			setMarketplaceSubscribed,
			setItemSubscribed,
			removeItemSubscription,
			refreshUserPage
		}),
		[
			isLoggedIn,
			loading,
			userPage,
			setCategorySubscribed,
			setMarketplaceSubscribed,
			setItemSubscribed,
			removeItemSubscription,
			refreshUserPage
		]
	);

	return (
		<AlarmSubscriptionsContext.Provider value={value}>
			{children}
		</AlarmSubscriptionsContext.Provider>
	);
}

export function useAlarmSubscriptions() {
	const ctx = useContext(AlarmSubscriptionsContext);
	if (!ctx) {
		throw new Error("useAlarmSubscriptions must be used within AlarmSubscriptionsProvider");
	}
	return ctx;
}
