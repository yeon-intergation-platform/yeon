import {
  YeonImage,
  type YeonImageProps,
} from "../../primitives/YeonImage/index.native";
import { YeonView } from "../../primitives/YeonView/index.native";
import { createYeonStyleSheet } from "../../runtime/YeonBrowserRuntime/index.native";
import { yeonMobileAppColors } from "../../theme";

export type YeonLaunchScreenProps = {
  imageSource: YeonImageProps["source"];
};

export function YeonLaunchScreen({ imageSource }: YeonLaunchScreenProps) {
  return (
    <YeonView style={styles.screen}>
      <YeonImage
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={imageSource}
        style={styles.image}
      />
    </YeonView>
  );
}

const styles = createYeonStyleSheet({
  screen: {
    alignItems: "center",
    backgroundColor: yeonMobileAppColors.background,
    flex: 1,
    justifyContent: "center",
  },
  image: {
    height: "100%",
    width: "100%",
  },
});
