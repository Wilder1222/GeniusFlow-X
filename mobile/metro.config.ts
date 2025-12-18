import { getDefaultConfig } from "expo/metro-config";
import { withNativeWind } from "nativewind/utils";

const config = getDefaultConfig(__dirname);

export default withNativeWind(config, { input: "./global.css" });
