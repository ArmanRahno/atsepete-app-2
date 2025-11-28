import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import ReportBugForm from "@/components/ReportBugForm";
import React from "react";
import { Text, View } from "react-native";

const ReportIssueModal = () => {
	return (
		<View className="flex-1">
			<Header>
				<HeaderText>Sorun Bildir</HeaderText>
			</Header>

			<ReportBugForm />
		</View>
	);
};

export default ReportIssueModal;
