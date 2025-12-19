import FilterAndSortDialog, { Filters, SORT_OPTIONS } from "@/components/FilterAndSortDialog";
import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import ItemCard from "@/components/item/item-card/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import React, { useState, useCallback, memo, useRef, useEffect } from "react";
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
import HeaderIcon from "@/components/header/HeaderIcon";
import HeaderSecondRow from "@/components/header/HeaderSecondRow";
import { ChevronUp } from "lucide-react-native";
import AppTouchableOpacity from "@/components/AppTouchableOpacity";
import { useIsFocused } from "@react-navigation/native";
import { lightMutedForeground } from "@/constants/Colors";

const API_URL = "https://atsepete.net/api/application/page/homepage";

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

	const [items, setItems] = useState<Item[]>([]);
	const [totalItems, setTotalItems] = useState<number>(0);

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
		[clearAutoLabelTimer]
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
			setItems(prev => concatUniqueById(pendingNew, prev));
			setPendingNew([]);
		}
	}, [isNearTop, pendingNew]);

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

		return () => stopAutoRefresh();
	}, [fetchPage, isFocused, resetCounter, startAutoRefresh, stopAutoRefresh]);

	const onRefresh = useCallback(async () => {
		resetCounter();

		stopAutoRefresh();

		remainingMsRef.current = null;
		nextAutoTickAtRef.current = null;

		await headRefresh({ silent: false, reason: "manual" });

		if (isHomeVisibleNow()) startAutoRefresh();
	}, [headRefresh, isHomeVisibleNow, resetCounter, startAutoRefresh, stopAutoRefresh]);

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

	return (
		<View style={styles.root}>
			<Header>
				<HeaderIcon />
				<HeaderSecondRow
					setDisplayDialog={setDisplayDialog}
					displaySortTouchable
				/>
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
						isNearTop
							? { minIndexForVisible: 0, autoscrollToTopThreshold: 80 }
							: undefined
					}
					ListHeaderComponent={
						<>
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
											color={lightMutedForeground}
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
					renderItem={({ item, index }) => (
						<MemoizedItemCard
							className={
								index === 0
									? "rounded-t-lg"
									: index === items.length - 1
									? "rounded-b-lg"
									: ""
							}
							item={item}
						/>
					)}
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
						<ChevronUp />
					</Text>
				</AppTouchableOpacity>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1 },
	listContent: { padding: 8, paddingBottom: 24 },
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
