import React, { useState } from "react";
import { Text, View } from "react-native";
import { Card } from "@/components/shad-cn/card";
import RegisterForm from "@/components/forms/RegisterForm";
import LoginForm from "@/components/forms/LoginForm";
import AppTouchableOpacity from "../AppTouchableOpacity";
import VersionInfo from "../VersionInfo";

const LoginAndRegisterFormsWrapper = ({ onSuccess }: { onSuccess: () => void }) => {
	const [isRegisterMode, setIsRegisterMode] = useState(false);

	return (
		<>
			{/* <KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior="padding"
			> */}
			<View className="flex-1 p-3 justify-center">
				<Card className="p-5 rounded-xl">
					{isRegisterMode && <RegisterForm onSuccess={onSuccess} />}
					{!isRegisterMode && <LoginForm onSuccess={onSuccess} />}

					<AppTouchableOpacity
						className="mt-4 h-10 items-center justify-center"
						onPress={() => setIsRegisterMode(!isRegisterMode)}
					>
						<Text className="text-primary text-center">
							{isRegisterMode ? "Hesabım var" : "Hesabım yok"}
						</Text>
					</AppTouchableOpacity>
				</Card>
			</View>
			{/* </KeyboardAvoidingView> */}
			<View className="p-3">
				<VersionInfo />
			</View>
		</>
	);
};

export default LoginAndRegisterFormsWrapper;
