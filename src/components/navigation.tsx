"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NotebookPen, MessageSquare, Box } from "lucide-react";

const NAV_ITEMS = [
	{ href: "/dump", label: "Dump", icon: NotebookPen },
	{ href: "/chat", label: "Chat", icon: MessageSquare },
];

export function Navigation() {
	const pathname = usePathname();

	return (
		<header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none">
			<nav className="flex items-center gap-1 p-1 bg-background/60 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl pointer-events-auto">
				<Link
					href="/"
					className="p-2 mr-2 ml-1 rounded-full hover:bg-muted transition-colors"
				>
					<Box className="w-5 h-5 text-primary font-bold" />
				</Link>

				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
								isActive
									? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)}
						>
							<Icon className="w-4 h-4" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</nav>
		</header>
	);
}
