import Header from "@/components/header/Header";
import HeaderText from "@/components/header/HeaderText";
import MakeSuggestionForm from "@/components/MakeSuggestionForm";
import React from "react";
import { View } from "react-native";

const MakeSuggestionModal = () => {
	return (
		<View className="flex-1">
			<Header>
				<HeaderText>Öneri Yap</HeaderText>
			</Header>

			<MakeSuggestionForm />
		</View>
	);
};

export default MakeSuggestionModal;
