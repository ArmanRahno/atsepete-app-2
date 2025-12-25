import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
	View,
	Text,
	StyleSheet,
	Modal,
	Pressable,
	FlatList,
	InteractionManager,
	Animated,
	ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Earnings } from "@/app/(tabs)/alarms";
import {
	lightBackground,
	lightBorder,
	lightForeground,
	lightMutedForeground
} from "@/constants/Colors";

type EarningsListProps = {
	earnings: Earnings | undefined;
};

const RADIUS = 12;
const PREVIEW_COUNT = 5;

const formatTRY = (n: number) => `₺${Number((n ?? 0).toFixed(4))}`;

const formatDateLinesTR = (iso: string) => {
	const d = new Date(iso);

	const dateLine = d.toLocaleDateString("tr-TR", {
		year: "numeric",
		month: "short",
		day: "numeric"
	});

	const timeLine = d.toLocaleTimeString("tr-TR", {
		hour: "2-digit",
		minute: "2-digit"
	});

	return { dateLine, timeLine };
};

const TableHeader = () => (
	<View style={styles.tableHeaderWrapper}>
		<View style={styles.tableHeader}>
			<Text style={[styles.tableHeaderCell, { flex: 1 }]}>#</Text>
			<Text style={[styles.tableHeaderCell, { flex: 3 }]}>TARİH</Text>
			<Text style={[styles.tableHeaderCell, { flex: 3 }]}>EYLEM</Text>
			<Text style={[styles.tableHeaderCell, { flex: 2 }]}>TUTAR</Text>
		</View>
	</View>
);

function ListOpeningOverlay() {
	const opacity = useRef(new Animated.Value(0.5)).current;

	useEffect(() => {
		const anim = Animated.loop(
			Animated.sequence([
				Animated.timing(opacity, { toValue: 0.6, duration: 600, useNativeDriver: true }),
				Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true })
			])
		);
		anim.start();
		return () => anim.stop();
	}, [opacity]);

	return (
		<Animated.View
			style={[styles.listOverlay, { opacity }]}
			pointerEvents="none"
		>
			<Text style={styles.listOverlayText}>Yükleniyor</Text>
			<ActivityIndicator
				size={26}
				color={styles.listOverlayText.color}
			/>
		</Animated.View>
	);
}

export default function EarningsList({ earnings }: EarningsListProps) {
	const [open, setOpen] = useState(false);
	const [isOpening, setIsOpening] = useState(false);

	const historySorted = useMemo(() => {
		const list = earnings?.earnings_history ?? [];
		return [...list].sort((a, b) => Date.parse(b.datetime) - Date.parse(a.datetime));
	}, [earnings?.earnings_history]);

	if (!earnings || historySorted.length === 0) {
		return (
			<Text className="text-destructive text-center mt-6 text-lg font-bold">
				Kazancınız bulunmamaktadır.
			</Text>
		);
	}

	const preview = historySorted.slice(0, PREVIEW_COUNT);
	const hasMore = historySorted.length > PREVIEW_COUNT;

	const openModal = useCallback(() => {
		setIsOpening(true);

		// Deprecated but used intentionally for transition timing.
		InteractionManager.runAfterInteractions(() => {
			setOpen(true);
			setIsOpening(false);
		});
	}, []);

	const closeModal = useCallback(() => setOpen(false), []);

	const renderRow = useCallback(
		({ item, index }: { item: any; index: number }) => {
			const isLast = index === historySorted.length - 1;
			const { dateLine, timeLine } = formatDateLinesTR(item.datetime);

			return (
				<View style={[styles.tableRow, isLast && { borderBottomWidth: 0 }]}>
					<Text style={[styles.tableCellMuted, { flex: 1 }]}>
						{historySorted.length - index}
					</Text>

					<Text style={[styles.tableCellStrong, { flex: 3 }]}>
						{dateLine}
						{"\n"}
						{timeLine}
					</Text>

					<Text style={[styles.tableCell, { flex: 3 }]}>{item.earning_action_type}</Text>

					<Text style={[styles.tableCellStrong, { flex: 2 }]}>
						{formatTRY(item.earning_amount)}
					</Text>
				</View>
			);
		},
		[historySorted.length]
	);

	return (
		<View className="mt-2">
			<View className="flex-row items-center justify-between mb-3">
				<Text className="text-xl font-medium">Kazançlar</Text>
			</View>

			<View style={styles.summaryRow}>
				<View style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>ÖDENEN</Text>
					<Text style={styles.summaryValue}>
						{formatTRY(earnings.earnings_paid_total || 0)}
					</Text>
				</View>

				<View style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>TOPLAM</Text>
					<Text style={styles.summaryValue}>
						{formatTRY(earnings.earnings_total || 0)}
					</Text>
				</View>

				<View style={styles.summaryCard}>
					<Text style={styles.summaryLabel}>ÖDENMEMİŞ</Text>
					<Text style={styles.summaryValue}>
						{formatTRY(earnings.earnings_unpaid_total || 0)}
					</Text>
				</View>
			</View>

			<View style={styles.tableFrame}>
				<Pressable
					onPress={hasMore ? openModal : undefined}
					disabled={!hasMore || isOpening}
					android_disableSound
					style={({ pressed }) => [styles.tablePressable, pressed && { opacity: 0.92 }]}
				>
					<View style={styles.tableInner}>
						<View
							style={styles.diagonalWatermark}
							pointerEvents="none"
						>
							<View style={styles.diagonalWatermarkWrapper}>
								<Text style={styles.diagonalWatermarkText}>
									Detay için tıklayınız
								</Text>
							</View>
						</View>

						<TableHeader />

						{preview.map((item, index) => {
							const isLast = index === preview.length - 1;
							const { dateLine, timeLine } = formatDateLinesTR(item.datetime);

							return (
								<View
									key={`${item.datetime}-${index}`}
									style={[styles.tableRow, isLast && { borderBottomWidth: 0 }]}
								>
									<Text style={[styles.tableCellMuted, { flex: 1 }]}>
										{historySorted.length - index}
									</Text>

									<Text style={[styles.tableCellStrong, { flex: 3 }]}>
										{dateLine}
										{"\n"}
										{timeLine}
									</Text>

									<Text style={[styles.tableCell, { flex: 3 }]}>
										{item.earning_action_type}
									</Text>

									<Text style={[styles.tableCellStrong, { flex: 2 }]}>
										{formatTRY(item.earning_amount)}
									</Text>
								</View>
							);
						})}

						{hasMore && (
							<View style={[styles.previewFooterBtn, isOpening && { opacity: 0.7 }]}>
								<Text style={styles.previewFooterText}>
									{historySorted.length - PREVIEW_COUNT} kayıt daha...
								</Text>
							</View>
						)}

						{isOpening && <ListOpeningOverlay />}
					</View>
				</Pressable>
			</View>

			<Modal
				visible={open}
				animationType="slide"
				onRequestClose={closeModal}
			>
				<SafeAreaView style={styles.modalRoot}>
					<View style={styles.modalTopBar}>
						<Text style={styles.modalTitle}>Kazanç Geçmişi</Text>
						<Pressable
							onPress={closeModal}
							hitSlop={10}
						>
							<Text style={styles.modalClose}>Kapat</Text>
						</Pressable>
					</View>

					<View style={styles.modalSummaryWrap}>
						<View style={styles.summaryRow}>
							<View style={styles.summaryCard}>
								<Text style={styles.summaryLabel}>ÖDENEN</Text>
								<Text style={styles.summaryValue}>
									{formatTRY(earnings.earnings_paid_total || 0)}
								</Text>
							</View>

							<View style={styles.summaryCard}>
								<Text style={styles.summaryLabel}>TOPLAM</Text>
								<Text style={styles.summaryValue}>
									{formatTRY(earnings.earnings_total || 0)}
								</Text>
							</View>

							<View style={styles.summaryCard}>
								<Text style={styles.summaryLabel}>ÖDENMEMİŞ</Text>
								<Text style={styles.summaryValue}>
									{formatTRY(earnings.earnings_unpaid_total || 0)}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.modalTableWrap}>
						<FlatList
							data={historySorted}
							keyExtractor={(item, idx) => `${item.datetime}-${idx}`}
							renderItem={renderRow}
							ListHeaderComponent={<TableHeader />}
							stickyHeaderIndices={[0]}
							showsVerticalScrollIndicator
							scrollIndicatorInsets={{ right: 6 }}
							initialNumToRender={16}
							maxToRenderPerBatch={16}
							windowSize={7}
							updateCellsBatchingPeriod={50}
							removeClippedSubviews
						/>
					</View>
				</SafeAreaView>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	summaryRow: {
		flexDirection: "row",
		gap: 6,
		marginBottom: 12
	},
	summaryCard: {
		flex: 1,
		borderWidth: 1,
		borderColor: lightBorder,
		borderRadius: RADIUS,
		paddingVertical: 10,
		paddingHorizontal: 12,
		backgroundColor: lightBackground
	},
	summaryLabel: {
		fontSize: 12,
		letterSpacing: 1,
		color: lightMutedForeground,
		fontWeight: "800"
	},
	summaryValue: {
		marginTop: 6,
		fontSize: 16,
		fontWeight: "800",
		color: lightForeground
	},

	tableFrame: {
		borderColor: lightBorder,
		borderWidth: 1,
		borderRadius: RADIUS,
		backgroundColor: "transparent",
		overflow: "hidden"
	},

	tablePressable: {
		backgroundColor: "transparent",
		position: "relative"
	},

	tableInner: {
		padding: 1
	},

	tableHeaderWrapper: {
		backgroundColor: lightBackground,
		borderBottomWidth: 1,
		borderColor: lightBorder
	},
	tableHeader: {
		flexDirection: "row",
		paddingVertical: 10,
		paddingHorizontal: 8
	},
	tableHeaderCell: {
		fontWeight: "900",
		color: lightForeground,
		textAlign: "center",
		textTransform: "uppercase",
		letterSpacing: 0.8
	},

	tableRow: {
		flexDirection: "row",
		gap: 4,
		paddingVertical: 10,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderColor: lightBorder
	},
	tableCell: { textAlign: "center", color: lightForeground, fontSize: 13 },
	tableCellStrong: {
		textAlign: "center",
		color: lightForeground,
		fontWeight: "700",
		fontSize: 13
	},
	tableCellMuted: { textAlign: "center", color: lightMutedForeground, fontSize: 13 },

	previewFooterBtn: {
		height: 48,
		justifyContent: "center",
		paddingHorizontal: 12,
		backgroundColor: lightBackground,
		borderTopWidth: 1,
		borderColor: lightBorder
	},
	previewFooterText: {
		textAlign: "center",
		fontWeight: "800",
		color: "#2563EB"
	},

	modalRoot: { flex: 1, backgroundColor: "white" },
	modalTopBar: {
		paddingHorizontal: 14,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderColor: lightBorder,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	modalTitle: { fontSize: 18, fontWeight: "800", color: lightForeground },
	modalClose: { fontSize: 16, fontWeight: "800", color: "#2563EB" },
	modalSummaryWrap: { padding: 12, paddingTop: 24 },
	modalTableWrap: {
		flex: 1,
		marginHorizontal: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: lightBorder,
		borderRadius: RADIUS,
		overflow: "hidden"
	},

	listOverlay: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "#000",
		borderRadius: RADIUS,
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 999
	},
	listOverlayText: { fontSize: 18, fontWeight: "800", color: "white" },

	diagonalWatermark: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1
	},
	diagonalWatermarkWrapper: {
		backgroundColor: "rgba(0, 0, 0, 0.2)",
		transform: [{ rotate: "-22deg" }],
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: RADIUS
	},
	diagonalWatermarkText: {
		fontSize: 32,
		fontWeight: "900",
		color: "rgb(255, 0, 0)",
		textAlign: "center",
		paddingHorizontal: 12
	}
});
