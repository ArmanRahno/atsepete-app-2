import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Card } from "@/components/shad-cn/card";
import RegisterForm from "@/components/forms/RegisterForm";
import LoginForm from "@/components/forms/LoginForm";

const LoginAndRegisterFormsWrapper = ({ onSuccess }: { onSuccess: () => void }) => {
	const [isRegisterMode, setIsRegisterMode] = useState(false);

	return (
		<View className="flex-1 p-4 justify-center">
			<Card className="p-4">
				{isRegisterMode && <RegisterForm onSuccess={onSuccess} />}
				{!isRegisterMode && <LoginForm onSuccess={onSuccess} />}

				<TouchableOpacity
					className="mt-4"
					onPress={() => setIsRegisterMode(!isRegisterMode)}
				>
					<Text className="text-primary text-center">
						{isRegisterMode ? "Hesabım var" : "Hesabım yok"}
					</Text>
				</TouchableOpacity>
			</Card>
		</View>
	);
};

export default LoginAndRegisterFormsWrapper;
