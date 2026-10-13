import { Inter, JetBrains_Mono } from "next/font/google";

// 공용 폰트 인스턴스. next/font는 호출부별로 폰트를 분리 로딩하므로,
// 여러 레이아웃(루트 "/" 리다이렉트 레이아웃과 [lang] 레이아웃)에서
// 같은 인스턴스를 재사용하도록 한 곳에서만 호출한다.
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});
