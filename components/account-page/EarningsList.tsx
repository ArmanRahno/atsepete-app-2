import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Earnings } from "@/app/(tabs)/alarms";
import {
	lightBackground,
	lightBorder,
	lightDestructive,
	lightForeground
} from "@/constants/Colors";

type EarningsListProps = {
	earnings: Earnings | undefined;
};

export default function EarningsList({ earnings }: EarningsListProps) {
	if (!earnings || earnings.earnings_history.length === 0)
		return (
			<Text className="text-destructive text-center mt-6 text-lg font-bold">
				Kazancınız bulunmamaktadır.
			</Text>
		);

	const historySorted = useMemo(
		() =>
			[...earnings.earnings_history].sort(
				(a, b) => Date.parse(b.datetime) - Date.parse(a.datetime)
			),
		[earnings.earnings_history]
	);

	return (
		<View className="mt-2">
			<Text className="text-xl font-medium mb-4">Kazançlar</Text>

			<View className="px-4 py-2 border border-border rounded-lg mb-4">
				<View className="flex-row">
					<Text className="flex-1 text-lg font-medium">Ödenen</Text>
					<Text className="flex-1 text-lg font-medium">Toplam</Text>
					<Text className="flex-1 text-lg font-medium">Ödenmemiş</Text>
				</View>
				<View className="flex-row">
					<Text className="flex-1 text-lg font-medium">
						₺{Number((earnings.earnings_paid_total || 0).toFixed(4))}
					</Text>
					<Text className="flex-1 text-lg font-medium">
						₺{Number((earnings.earnings_total || 0).toFixed(4))}
					</Text>
					<Text className="flex-1 text-lg font-medium">
						₺{Number((earnings.earnings_unpaid_total || 0).toFixed(4))}
					</Text>
				</View>
			</View>

			<View style={styles.tableContainer}>
				<ScrollView
					nestedScrollEnabled
					style={{ maxHeight: 384 }}
					stickyHeaderIndices={[0]}
				>
					<View style={styles.tableHeaderWrapper}>
						<View style={styles.tableHeader}>
							<Text style={[styles.tableHeaderCell, { flex: 1 }]}>#</Text>
							<Text style={[styles.tableHeaderCell, { flex: 3 }]}>Tarih</Text>
							<Text style={[styles.tableHeaderCell, { flex: 3 }]}>Eylem</Text>
							<Text style={[styles.tableHeaderCell, { flex: 2 }]}>Tutar</Text>
						</View>
					</View>

					{historySorted.map((item, index) => {
						const isLast = index === historySorted.length - 1;
						return (
							<View
								key={`${item.datetime}-${index}`}
								style={[styles.tableRow, isLast && { borderBottomWidth: 0 }]}
							>
								<Text
									className="text-muted-foreground"
									style={[styles.tableCell, { flex: 1 }]}
								>
									{historySorted.length - index}
								</Text>
								<Text
									className="font-medium"
									style={[styles.tableCell, { flex: 3 }]}
								>
									{new Date(item.datetime).toLocaleDateString("tr-TR", {
										year: "numeric",
										month: "short",
										day: "numeric",
										hour: "numeric",
										minute: "numeric"
									})}
								</Text>
								<Text style={[styles.tableCell, { flex: 3 }]}>
									{item.earning_action_type}
								</Text>
								<Text
									className="font-semibold"
									style={[styles.tableCell, { flex: 2 }]}
								>
									₺{Number(item.earning_amount.toFixed(4))}
								</Text>
							</View>
						);
					})}
				</ScrollView>
			</View>
		</View>
	);
}

const RADIUS = 12;

const styles = StyleSheet.create({
	tableContainer: {
		borderColor: lightBorder,
		borderWidth: 1,
		borderRadius: RADIUS,
		overflow: "hidden",
		backgroundColor: "transparent"
	},
	tableHeaderWrapper: {
		backgroundColor: lightBackground,
		borderBottomWidth: 1,
		borderColor: lightBorder,
		zIndex: 2,
		elevation: 2
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: lightBackground,
		padding: 8
	},
	tableHeaderCell: {
		fontWeight: "bold",
		color: lightForeground,
		textAlign: "center"
	},
	tableRow: {
		flexDirection: "row",
		padding: 8,
		borderBottomWidth: 1,
		borderColor: lightBorder,
		backgroundColor: "transparent"
	},
	tableCell: { textAlign: "center", color: lightForeground },
	emptyListText: {
		fontWeight: "600",
		color: lightDestructive,
		textAlign: "center",
		padding: 12
	}
});
