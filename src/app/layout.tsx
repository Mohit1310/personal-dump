import "@/styles/globals.css";

import type { Metadata } from "next";
import { JetBrains_Mono, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
	title: "Personal Dump • Your Second Brain",
	description:
		"Store your messy thoughts, code snippets, and error logs. Retrieve them through intelligent AI conversations.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const outfit = Outfit({
	subsets: ["latin"],
	variable: "--font-outfit",
	display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html
			className={`${outfit.variable} ${jetbrainsMono.variable}`}
			lang="en"
			suppressHydrationWarning
		>
			<body>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
					enableSystem
				>
					<Navigation />
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
