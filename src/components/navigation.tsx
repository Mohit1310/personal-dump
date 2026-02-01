"use client";

import { Box, MessageSquare, NotebookPen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
	{ href: "/dump", label: "Dump", icon: NotebookPen },
	{ href: "/chat", label: "Chat", icon: MessageSquare },
];

export function Navigation() {
	const pathname = usePathname();

	return (
		<header className="pointer-events-none fixed top-0 right-0 left-0 z-50 flex justify-center p-4">
			<nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/50 bg-background/60 p-1 shadow-2xl backdrop-blur-xl">
				<Link
					className="mr-2 ml-1 rounded-full p-2 transition-colors hover:bg-muted"
					href="/"
				>
					<Box className="h-5 w-5 font-bold text-primary" />
				</Link>

				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							className={cn(
								"flex items-center gap-2 rounded-full px-4 py-2 font-medium text-sm transition-all",
								isActive
									? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
							href={item.href}
							key={item.href}
						>
							<Icon className="h-4 w-4" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</header>
	);
}
