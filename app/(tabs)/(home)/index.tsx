import FilterAndSortDialog, { Filters, SORT_OPTIONS } from "@/components/FilterAndSortDialog";
import BarcodeScanButton from "@/components/barcode-scan/BarcodeScanButton";
import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import ItemCard from "@/components/item/item-card/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import React, { useState, useCallback, memo, useRef, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import formatPrice from "@/lib/formatPrice";
import {
	RefreshControl,
	ActivityIndicator,
	View,
	NativeSyntheticEvent,
	NativeScrollEvent,
	Text,
	AppState,
	AppStateStatus,
	StyleSheet,
	FlatList
} from "react-native";
import FilterAndSortAppliedFilter from "@/components/FilterAndSortAppliedFilter";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import {
	Bell,
	ChartNoAxesCombined,
	ChevronUp,
	ListChecks,
	ScanBarcode,
	Search,
	X
} from "lucide-react-native";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import { useIsFocused } from "@react-navigation/native";
import HeaderFirstRow from "@/components/header/HeaderFirstRow";
import { useThemePalette } from "@/hooks/useThemePalette";
import { useRouter } from "expo-router";

const API_URL = "https://atsepete.net/api/application/page/homepage";
const HOMEPAGE_CONTENT_URL = "https://atsepete.net/api/application/page/homepage-content";
const PRICE_ASSISTANT_DISMISSED_KEY = "home-price-assistant-dismissed";

const AUTO_REFRESH_BASE_MS = 30_000;
const AUTO_JITTER_MIN = 0.9;
const AUTO_JITTER_MAX = 1.1;
const AUTO_MAX_PER_VISIBILITY_SESSION = 10;

const NEAR_TOP_Y = 120;
const BACK_TO_TOP_Y = 800;

type HomepageData = {
	items: Item[];
	totalItems: number;
};

type HomepageContentData = {
	summary?: {
		deal_count: number | null;
		last_24_hours_count: number | null;
		marketplace_count: number | null;
	};
};

const defaultFilters: Filters = {
	sort: "en-yeni"
};

const MemoizedItemCard = memo(ItemCard);

const concatUniqueById = (first: Item[], second: Item[]) => {
	const seen = new Set<string>();
	const out: Item[] = [];

	for (const it of [...first, ...second]) {
		const id = String(it._id);
		if (seen.has(id)) continue;
		seen.add(id);
		out.push(it);
	}
	return out;
};

export default function HomeScreen() {
	const isFocused = useIsFocused();
	const { colors } = useThemePalette();
	const router = useRouter();

	const [items, setItems] = useState<Item[]>([]);
	const [totalItems, setTotalItems] = useState<number>(0);
	const [homepageContent, setHomepageContent] = useState<HomepageContentData | null>(null);

	const [loading, setLoading] = useState<boolean>(false);
	const [loadingMore, setLoadingMore] = useState<boolean>(false);
	const [refreshing, setRefreshing] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);

	const [filters, setFilters] = useState<Filters>(defaultFilters);
	const [displayDialog, setDisplayDialog] = useState<boolean>(false);

	const [displayBackToTopBtn, setDisplayBackToTopBtn] = useState<boolean>(false);

	const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
	const [lastUpdatedLabel, setLastUpdatedLabel] = useState<string | null>(null);

	const [isAutoRefreshing, setIsAutoRefreshing] = useState(false);
	const [autoRefreshLabel, setAutoRefreshLabel] = useState<string | null>(null);

	const [pendingNew, setPendingNew] = useState<Item[]>([]);
	const [isNearTop, setIsNearTop] = useState<boolean>(true);
	const [isAssistantDismissed, setIsAssistantDismissed] = useState<boolean>(false);

	const [maintain, setMaintain] = useState<boolean>(false);
	const maintainOnce = useCallback(() => {
		setMaintain(true);
		requestAnimationFrame(() => setMaintain(false));
	}, []);

	const skipAutoApplyPendingRef = useRef(false);

	const listRef = useRef<FlatList<Item>>(null);

	const itemsRef = useRef<Item[]>([]);
	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	const filtersRef = useRef<Filters>(defaultFilters);
	useEffect(() => {
		filtersRef.current = filters;
	}, [filters]);

	const isNearTopRef = useRef<boolean>(true);
	useEffect(() => {
		isNearTopRef.current = isNearTop;
	}, [isNearTop]);

	const inFlightRef = useRef<boolean>(false);

	const isFocusedRef = useRef<boolean>(false);
	const appStateRef = useRef<AppStateStatus>(AppState.currentState);
	const [homeVisible, setHomeVisible] = useState<boolean>(
		isFocused && appStateRef.current === "active"
	);

	const isHomeVisibleNow = useCallback(() => {
		return isFocusedRef.current && appStateRef.current === "active";
	}, []);

	const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const autoStoppedRef = useRef<boolean>(true);
	const refreshCounterRef = useRef<number>(0);

	const nextAutoTickAtRef = useRef<number | null>(null);
	const remainingMsRef = useRef<number | null>(null);

	const autoLabelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		AsyncStorage.getItem(PRICE_ASSISTANT_DISMISSED_KEY)
			.then(value => {
				if (value === "true") setIsAssistantDismissed(true);
			})
			.catch(() => {});
	}, []);

	const dismissAssistant = useCallback(() => {
		setIsAssistantDismissed(true);
		void AsyncStorage.setItem(PRICE_ASSISTANT_DISMISSED_KEY, "true");
	}, []);

	const clearAutoTimer = useCallback(() => {
		if (autoTimerRef.current) {
			clearTimeout(autoTimerRef.current);
			autoTimerRef.current = null;
		}
	}, []);

	const clearAutoLabelTimer = useCallback(() => {
		if (autoLabelTimeoutRef.current) {
			clearTimeout(autoLabelTimeoutRef.current);
			autoLabelTimeoutRef.current = null;
		}
	}, []);

	const fetchHomepageContent = useCallback(async () => {
		try {
			const response = await fetch(HOMEPAGE_CONTENT_URL);
			if (!response.ok) throw new Error("Error fetching homepage content");

			const content = (await response.json()) as HomepageContentData;
			setHomepageContent(content);
		} catch (error) {
			console.error("Error fetching homepage content:", error);
		}
	}, []);

	useEffect(() => {
		return () => {
			clearAutoTimer();
			clearAutoLabelTimer();
		};
	}, [clearAutoLabelTimer, clearAutoTimer]);

	useEffect(() => {
		if (!lastUpdatedAt) return;
		if (!homeVisible) return;

		const updateLabel = () => {
			const diffMs = Date.now() - lastUpdatedAt.getTime();
			const diffSec = Math.floor(diffMs / 1000);

			if (diffSec < 60) return setLastUpdatedLabel(`${diffSec} saniye`);

			const diffMin = Math.floor(diffSec / 60);
			if (diffMin < 60) return setLastUpdatedLabel(`${diffMin} dakika`);

			const diffHours = Math.floor(diffMin / 60);
			setLastUpdatedLabel(`${diffHours} saat`);
		};

		updateLabel();
		const intervalId = setInterval(updateLabel, 1000);
		return () => clearInterval(intervalId);
	}, [lastUpdatedAt, homeVisible]);

	const buildParams = (pageNum: number, localFilters: Filters) => {
		const params = new URLSearchParams();
		if (pageNum > 0) params.set("p", String(pageNum + 1));
		if (localFilters.sort) params.set("siralama", localFilters.sort);
		if (localFilters.minPrice) params.set("min-fiyat", localFilters.minPrice);
		if (localFilters.maxPrice) params.set("max-fiyat", localFilters.maxPrice);
		return params;
	};

	const fetchPage = useCallback(
		async ({
			pageNum,
			append,
			localFilters,
			showSpinner
		}: {
			pageNum: number;
			append: boolean;
			localFilters: Filters;
			showSpinner: boolean;
		}) => {
			if (inFlightRef.current) return;

			inFlightRef.current = true;
			try {
				if (showSpinner) {
					if (append) setLoadingMore(true);
					else setLoading(true);
				}

				const params = buildParams(pageNum, localFilters);
				const response = await fetch(`${API_URL}?${params.toString()}`);
				if (!response.ok) throw new Error("Error fetching items");

				const data: HomepageData = await response.json();
				setTotalItems(data.totalItems);

				const incoming = data.items.slice(0, 18);

				setItems(prev => {
					if (append) return concatUniqueById(prev, incoming);
					return incoming;
				});

				setLastUpdatedAt(new Date());
			} catch (error) {
				console.error("Error fetching homepage items:", error);
			} finally {
				inFlightRef.current = false;
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[]
	);

	const headRefresh = useCallback(
		async ({ silent, reason }: { silent: boolean; reason: "auto" | "manual" }) => {
			if (inFlightRef.current) return;

			inFlightRef.current = true;

			if (reason === "auto") {
				setIsAutoRefreshing(true);
				setAutoRefreshLabel(null);
			}

			let ok = false;

			try {
				if (!silent) setRefreshing(true);

				const params = buildParams(0, filtersRef.current);
				const response = await fetch(`${API_URL}?${params.toString()}`);
				if (!response.ok) throw new Error("Error head refreshing items");

				const data: HomepageData = await response.json();
				setTotalItems(data.totalItems);

				const incoming = data.items.slice(0, 18);

				const currentIds = new Set(itemsRef.current.map(x => String(x._id)));
				const newOnes = incoming.filter(x => !currentIds.has(String(x._id)));

				if (newOnes.length > 0) {
					if (isNearTopRef.current) {
						maintainOnce();
						setItems(prev => concatUniqueById(newOnes, prev));
					} else {
						setPendingNew(prev => concatUniqueById(newOnes, prev));
					}
				}

				setLastUpdatedAt(new Date());
				ok = true;
			} catch (error) {
				console.error(`[${reason}] head refresh error:`, error);
			} finally {
				inFlightRef.current = false;
				if (!silent) setRefreshing(false);

				if (reason === "auto") {
					setIsAutoRefreshing(false);

					if (ok) {
						setAutoRefreshLabel("Liste güncellendi.");
						clearAutoLabelTimer();
						autoLabelTimeoutRef.current = setTimeout(() => {
							setAutoRefreshLabel(null);
							autoLabelTimeoutRef.current = null;
						}, 2500);
					}
				}
			}
		},
		[clearAutoLabelTimer, maintainOnce]
	);

	const headRefreshRef = useRef<
		(args: { silent: boolean; reason: "auto" | "manual" }) => Promise<void>
	>(async () => {});
	useEffect(() => {
		headRefreshRef.current = headRefresh;
	}, [headRefresh]);

	useEffect(() => {
		if (skipAutoApplyPendingRef.current) return;

		if (isNearTop && pendingNew.length > 0) {
			maintainOnce();
			setItems(prev => concatUniqueById(pendingNew, prev));
			setPendingNew([]);
		}
	}, [isNearTop, pendingNew, maintainOnce]);

	const resetCounter = useCallback(() => {
		refreshCounterRef.current = 0;
	}, []);

	const stopAutoRefresh = useCallback(() => {
		if (autoStoppedRef.current) {
			clearAutoTimer();
			return;
		}

		autoStoppedRef.current = true;

		if (nextAutoTickAtRef.current != null) {
			remainingMsRef.current = Math.max(0, nextAutoTickAtRef.current - Date.now());
		}

		nextAutoTickAtRef.current = null;
		clearAutoTimer();
	}, [clearAutoTimer]);

	const scheduleNextAutoTickRef = useRef<() => void>(() => {});

	useEffect(() => {
		scheduleNextAutoTickRef.current = () => {
			if (autoStoppedRef.current) return;

			const jitter = AUTO_JITTER_MIN + Math.random() * (AUTO_JITTER_MAX - AUTO_JITTER_MIN);
			const delayMs = Math.floor(AUTO_REFRESH_BASE_MS * jitter);

			nextAutoTickAtRef.current = Date.now() + delayMs;

			clearAutoTimer();
			autoTimerRef.current = setTimeout(() => {
				autoTimerRef.current = null;
				nextAutoTickAtRef.current = null;

				void (async () => {
					if (autoStoppedRef.current) return;

					if (!isHomeVisibleNow()) {
						stopAutoRefresh();
						return;
					}

					if (refreshCounterRef.current >= AUTO_MAX_PER_VISIBILITY_SESSION) {
						stopAutoRefresh();
						return;
					}

					if (inFlightRef.current) {
						scheduleNextAutoTickRef.current();
						return;
					}

					try {
						await headRefreshRef.current({ silent: true, reason: "auto" });
					} finally {
						refreshCounterRef.current += 1;
						scheduleNextAutoTickRef.current();
					}
				})();
			}, delayMs);
		};
	}, [clearAutoTimer, isHomeVisibleNow, stopAutoRefresh]);

	const startAutoRefresh = useCallback(() => {
		if (!autoStoppedRef.current) return;

		clearAutoTimer();
		autoStoppedRef.current = false;

		const remaining = remainingMsRef.current;
		remainingMsRef.current = null;

		if (typeof remaining === "number") {
			const ms = Math.max(0, remaining);
			nextAutoTickAtRef.current = Date.now() + ms;

			autoTimerRef.current = setTimeout(() => {
				autoTimerRef.current = null;
				nextAutoTickAtRef.current = null;

				void (async () => {
					if (autoStoppedRef.current) return;

					if (!isHomeVisibleNow()) {
						stopAutoRefresh();
						return;
					}

					if (refreshCounterRef.current >= AUTO_MAX_PER_VISIBILITY_SESSION) {
						stopAutoRefresh();
						return;
					}

					if (inFlightRef.current) {
						scheduleNextAutoTickRef.current();
						return;
					}

					try {
						await headRefreshRef.current({ silent: true, reason: "auto" });
					} finally {
						refreshCounterRef.current += 1;
						scheduleNextAutoTickRef.current();
					}
				})();
			}, ms);

			return;
		}

		scheduleNextAutoTickRef.current();
	}, [clearAutoTimer, isHomeVisibleNow, stopAutoRefresh]);

	useEffect(() => {
		const sub = AppState.addEventListener("change", nextState => {
			appStateRef.current = nextState;

			const visible = isFocusedRef.current && nextState === "active";
			setHomeVisible(visible);

			if (nextState !== "active") {
				stopAutoRefresh();
				return;
			}

			if (isHomeVisibleNow()) {
				resetCounter();
				startAutoRefresh();
			}
		});

		return () => sub.remove();
	}, [isHomeVisibleNow, resetCounter, startAutoRefresh, stopAutoRefresh]);

	useEffect(() => {
		isFocusedRef.current = isFocused;

		const visible = isFocused && appStateRef.current === "active";
		setHomeVisible(visible);

		if (!isFocused) {
			stopAutoRefresh();
			return;
		}

		resetCounter();
		startAutoRefresh();

		if (itemsRef.current.length === 0) {
			void fetchPage({
				pageNum: 0,
				append: false,
				localFilters: filtersRef.current,
				showSpinner: true
			});
		}

		if (!homepageContent) {
			void fetchHomepageContent();
		}

		return () => stopAutoRefresh();
	}, [
		fetchHomepageContent,
		fetchPage,
		homepageContent,
		isFocused,
		resetCounter,
		startAutoRefresh,
		stopAutoRefresh
	]);

	const onRefresh = useCallback(async () => {
		resetCounter();

		stopAutoRefresh();

		remainingMsRef.current = null;
		nextAutoTickAtRef.current = null;

		await Promise.all([
			headRefresh({ silent: false, reason: "manual" }),
			fetchHomepageContent()
		]);

		if (isHomeVisibleNow()) startAutoRefresh();
	}, [
		fetchHomepageContent,
		headRefresh,
		isHomeVisibleNow,
		resetCounter,
		startAutoRefresh,
		stopAutoRefresh
	]);

	const handleLoadMore = useCallback(() => {
		if (loadingMore) return;
		if (itemsRef.current.length >= totalItems) return;
		if (inFlightRef.current) return;

		const nextPage = page + 1;
		setPage(nextPage);

		void fetchPage({
			pageNum: nextPage,
			append: true,
			localFilters: filtersRef.current,
			showSpinner: true
		});
	}, [fetchPage, loadingMore, page, totalItems]);

	const handleApply = useCallback(
		async (params: { minPrice?: string; maxPrice?: string; sort?: string }) => {
			stopAutoRefresh();
			resetCounter();

			setPendingNew([]);
			setDisplayBackToTopBtn(false);
			setIsNearTop(true);
			isNearTopRef.current = true;

			setFilters(params);
			setPage(0);

			await fetchPage({ pageNum: 0, append: false, localFilters: params, showSpinner: true });

			setDisplayDialog(false);
			if (isHomeVisibleNow()) startAutoRefresh();
		},
		[fetchPage, isHomeVisibleNow, resetCounter, startAutoRefresh, stopAutoRefresh]
	);

	const handleClearFilters = useCallback(async () => {
		stopAutoRefresh();
		resetCounter();

		setPendingNew([]);
		setDisplayBackToTopBtn(false);
		setIsNearTop(true);
		isNearTopRef.current = true;

		setFilters(defaultFilters);
		setPage(0);

		await fetchPage({
			pageNum: 0,
			append: false,
			localFilters: defaultFilters,
			showSpinner: true
		});

		setDisplayDialog(false);
		if (isHomeVisibleNow()) startAutoRefresh();
	}, [fetchPage, isHomeVisibleNow, resetCounter, startAutoRefresh, stopAutoRefresh]);

	const handleScroll = useCallback(
		(e: NativeSyntheticEvent<NativeScrollEvent>) => {
			const y = e.nativeEvent.contentOffset.y;

			const nearTopNow = y < NEAR_TOP_Y;
			if (nearTopNow !== isNearTopRef.current) {
				isNearTopRef.current = nearTopNow;
				setIsNearTop(nearTopNow);
			}

			const backToTopNow = y > BACK_TO_TOP_Y;
			if (backToTopNow !== displayBackToTopBtn) {
				setDisplayBackToTopBtn(backToTopNow);
			}
		},
		[displayBackToTopBtn]
	);

	const handleScrollToTop = useCallback(() => {
		listRef.current?.scrollToOffset({ offset: 0, animated: true });
	}, []);

	const applyPendingNewAndGoTop = useCallback(() => {
		if (pendingNew.length === 0) return;

		const snapshot = pendingNew;

		skipAutoApplyPendingRef.current = true;

		isNearTopRef.current = true;
		setIsNearTop(true);

		listRef.current?.scrollToOffset({ offset: 0, animated: false });

		requestAnimationFrame(() => {
			setItems(prev => concatUniqueById(snapshot, prev));
			setPendingNew([]);

			skipAutoApplyPendingRef.current = false;
		});
	}, [pendingNew]);

	const goToProducts = useCallback(() => router.push("/urunler"), [router]);
	const goToCategories = useCallback(() => router.push("/kategoriler"), [router]);
	const goToAlerts = useCallback(() => router.push("/alarms"), [router]);

	const formatCount = useCallback(
		(value: number | null | undefined) =>
			typeof value === "number" && Number.isFinite(value) ? value.toLocaleString("tr-TR") : "-",
		[]
	);

	const assistantSummary = React.useMemo(() => {
		const summary = homepageContent?.summary;

		return [
			{
				label: "Fırsat havuzu",
				value: formatCount(summary?.deal_count)
			},
			{
				label: "Son 24 saat",
				value: formatCount(summary?.last_24_hours_count)
			},
			{
				label: "Pazaryeri",
				value: formatCount(summary?.marketplace_count)
			}
		];
	}, [formatCount, homepageContent]);

	const renderAssistantAction = useCallback(
		({
			icon,
			label,
			onPress
		}: {
			icon: React.ReactNode;
			label: string;
			onPress: () => void;
		}) => (
			<AppTouchableOpacity
				key={label}
				onPress={onPress}
				className="flex-1 rounded-lg border border-border bg-background px-3 py-3"
				style={styles.assistantAction}
			>
				<View style={styles.assistantActionIcon}>{icon}</View>
				<Text
					className="text-foreground text-sm font-semibold"
					numberOfLines={2}
					adjustsFontSizeToFit
					minimumFontScale={0.86}
				>
					{label}
				</Text>
			</AppTouchableOpacity>
		),
		[]
	);

	return (
		<View style={styles.root}>
			<Header>
				<HeaderFirstRow
					setDisplayDialog={setDisplayDialog}
					displaySortTouchable
				/>
				<HeaderSecondRow />
			</Header>

			<FilterAndSortDialog
				visible={displayDialog}
				onClose={() => setDisplayDialog(false)}
				onApply={handleApply}
				onClearFilters={handleClearFilters}
				filters={filters}
			/>

			{loading && <LoadingIndicator />}

			{!loading && (
				<FlatList
					ref={listRef}
					data={items}
					onScroll={handleScroll}
					scrollEventThrottle={32}
					maintainVisibleContentPosition={
						maintain ? { minIndexForVisible: 0 } : undefined
					}
					ListHeaderComponent={
						<>
							{!isAssistantDismissed && (
								<View
									className="rounded-lg border border-border bg-card p-4 mb-3"
									style={styles.assistantPanel}
								>
									<View style={styles.assistantHeaderRow}>
										<View className="flex-1 pr-3">
											<Text className="text-foreground text-lg font-bold">
												Fiyat Takip Merkezi
											</Text>
											<Text className="text-muted-foreground text-sm mt-1">
												Ürünü bulun, fiyat geçmişini inceleyin, doğru alarmı
												kurun.
											</Text>
										</View>
										<AppTouchableOpacity
											onPress={dismissAssistant}
											className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-secondary"
											hitSlop={10}
										>
											<X
												size={16}
												color={colors.mutedForeground}
												strokeWidth={2.4}
											/>
										</AppTouchableOpacity>
										<View
											className="rounded-full bg-primary/10"
											style={styles.assistantBadge}
										>
											<ChartNoAxesCombined
												size={22}
												color={colors.primary}
												strokeWidth={2.3}
											/>
										</View>
									</View>

									<View style={styles.assistantGrid}>
										<BarcodeScanButton
											hitSlop={0}
											className="flex-1 rounded-lg border border-border bg-background px-3 py-3"
										>
											<View style={styles.assistantAction}>
												<View style={styles.assistantActionIcon}>
													<ScanBarcode
														size={19}
														color={colors.primary}
														strokeWidth={2.4}
													/>
												</View>
												<Text
													className="text-foreground text-sm font-semibold"
													numberOfLines={2}
													adjustsFontSizeToFit
													minimumFontScale={0.86}
												>
													Barkodla Karşılaştır
												</Text>
											</View>
										</BarcodeScanButton>

										{renderAssistantAction({
											icon: (
												<Search
													size={19}
													color={colors.primary}
													strokeWidth={2.4}
												/>
											),
											label: "Alarm Kurulacak Ürün Bul",
											onPress: goToProducts
										})}
									</View>

									<View style={styles.assistantGrid}>
										{renderAssistantAction({
											icon: (
												<Bell
													size={19}
													color={colors.primary}
													strokeWidth={2.4}
												/>
											),
											label: "Kategoriyle Takip Kur",
											onPress: goToCategories
										})}

										{renderAssistantAction({
											icon: (
												<ListChecks
													size={19}
													color={colors.primary}
													strokeWidth={2.4}
												/>
											),
											label: "Takip Listem",
											onPress: goToAlerts
										})}
									</View>

									<View className="mt-4 rounded-lg border border-border bg-secondary p-3">
										<Text className="text-foreground text-sm font-bold mb-3">
											Bugünün Özeti
										</Text>
										<View style={styles.summaryGrid}>
											{assistantSummary.map(item => (
												<View
													key={item.label}
													className="rounded-lg bg-background px-3 py-2"
													style={styles.summaryCell}
												>
													<Text className="text-muted-foreground text-xs">
														{item.label}
													</Text>
													<Text className="text-foreground text-base font-bold mt-1">
														{item.value}
													</Text>
												</View>
											))}
										</View>
									</View>
								</View>
							)}

							<HeaderText className="mt-2 mb-2">
								4 Milyon Üründe Yakalanan İndirimler
							</HeaderText>

							{(filters.sort !== "en-yeni" ||
								filters.minPrice ||
								filters.maxPrice) && (
								<View className="flex-row gap-2 mb-4">
									<View className="flex-1 flex-row flex-wrap gap-x-1 gap-y-0.5 pr-2">
										{filters.sort !== "en-yeni" && (
											<FilterAndSortAppliedFilter
												onPress={() =>
													setFilters(val => ({ ...val, sort: "en-yeni" }))
												}
											>
												{SORT_OPTIONS.find(
													opt => opt.value === filters.sort
												)?.label || filters.sort}
											</FilterAndSortAppliedFilter>
										)}

										{filters.minPrice && (
											<FilterAndSortAppliedFilter
												onPress={() =>
													setFilters(val => ({ ...val, minPrice: "" }))
												}
											>
												Min. Fiyat: ₺{formatPrice(+filters.minPrice)}
											</FilterAndSortAppliedFilter>
										)}

										{filters.maxPrice && (
											<FilterAndSortAppliedFilter
												onPress={() =>
													setFilters(val => ({ ...val, maxPrice: "" }))
												}
											>
												Max. Fiyat: ₺{formatPrice(+filters.maxPrice)}
											</FilterAndSortAppliedFilter>
										)}
									</View>
								</View>
							)}

							<View style={styles.statusRow}>
								{isAutoRefreshing ? (
									<>
										<Text className="text-xs text-muted-foreground">
											Liste güncelleniyor…
										</Text>
										<ActivityIndicator
											color={colors.mutedForeground}
											size={10}
											style={styles.statusSpinner}
										/>
									</>
								) : autoRefreshLabel ? (
									<Text className="text-xs text-muted-foreground">
										{autoRefreshLabel}
									</Text>
								) : lastUpdatedLabel ? (
									<Text className="text-xs text-muted-foreground">
										Liste {lastUpdatedLabel} önce güncellendi. Yenilemek için
										aşağı kaydırın.
									</Text>
								) : null}
							</View>
						</>
					}
					keyExtractor={item => String(item._id)}
					renderItem={({ item }) => {
						return (
							<MemoizedItemCard
								item={item}
								displayItemListener
							/>
						);
					}}
					ItemSeparatorComponent={() => <View className="h-2" />}
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={onRefresh}
						/>
					}
					onEndReached={handleLoadMore}
					onEndReachedThreshold={0.6}
					ListFooterComponent={
						loadingMore ? (
							<View style={{ padding: 16 }}>
								<ActivityIndicator />
							</View>
						) : null
					}
					contentContainerStyle={styles.listContent}
				/>
			)}

			{pendingNew.length > 0 && !isNearTop && (
				<AppTouchableOpacity
					onPress={applyPendingNewAndGoTop}
					className="absolute self-center bg-background border border-border px-3 py-2 rounded-lg"
					style={styles.newBanner}
				>
					<Text className="text-sm">{pendingNew.length} yeni indirimi göster</Text>
				</AppTouchableOpacity>
			)}

			{displayBackToTopBtn && (
				<AppTouchableOpacity
					className="absolute bottom-4 right-4 bg-background p-2 border border-border rounded-lg"
					onPress={handleScrollToTop}
				>
					<Text>
						<ChevronUp color={colors.text} />
					</Text>
				</AppTouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	listContent: {
		paddingHorizontal: 8,
		paddingTop: 8,
		paddingBottom: 24
	},
	assistantPanel: {
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 10,
		elevation: 2
	},
	assistantHeaderRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 14
	},
	assistantBadge: {
		width: 44,
		height: 44,
		alignItems: "center",
		justifyContent: "center"
	},
	assistantGrid: {
		flexDirection: "row",
		gap: 8,
		marginTop: 8
	},
	assistantAction: {
		minHeight: 72,
		justifyContent: "center",
		gap: 8
	},
	assistantActionIcon: {
		height: 24,
		justifyContent: "center"
	},
	summaryGrid: {
		flexDirection: "row",
		gap: 8
	},
	summaryCell: {
		flex: 1,
		minHeight: 58,
		justifyContent: "center"
	},
	newBanner: { top: 96 },
	statusRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 4
	},
	statusSpinner: {
		marginLeft: 6
	}
});
