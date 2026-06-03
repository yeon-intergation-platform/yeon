import Svg, { Circle, Path } from "react-native-svg";

// 카드 앱 하단 탭 전용 벡터 아이콘(lucide 스타일). 공용 YeonIcon은 native에서
// 유니코드 글리프라 탭 바에서 어색해, 카드 탭만 선명한 SVG 아이콘으로 렌더한다.
export type CardTabIconName = "rooms" | "home" | "settings";

type CardTabIconProps = {
  name: CardTabIconName;
  color: string;
  size: number;
};

export function CardTabIcon({ name, color, size }: CardTabIconProps) {
  return (
    <Svg
      fill="none"
      height={size}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
    >
      {name === "rooms" ? (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <Circle cx="9" cy="7" r="4" />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ) : null}
      {name === "home" ? (
        <>
          <Path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
          <Path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        </>
      ) : null}
      {name === "settings" ? (
        <>
          <Path d="M20 7h-9" />
          <Path d="M14 17H5" />
          <Circle cx="17" cy="17" r="3" />
          <Circle cx="7" cy="7" r="3" />
        </>
      ) : null}
    </Svg>
  );
}
