import Amazon from "@/assets/icons/Amazon";
import Avansas from "@/assets/icons/Avansas";
import React, { useState, useEffect } from "react";
import { Image, ImageSourcePropType, View } from "react-native";

type ResizedMarketplaceImageProps = { source: ImageSourcePropType; scale?: number };

const ResizedMarketplaceImage = ({ source, scale = 0.35 }: ResizedMarketplaceImageProps) => {
	return (
		<>
			<Avansas />
			<Amazon />
			<Image
				source={source}
				resizeMode="contain"
			/>
		</>
	);
};

export default ResizedMarketplaceImage;
