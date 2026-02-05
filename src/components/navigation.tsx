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
		<header className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between border-border border-b bg-background/80 px-6 py-4 backdrop-blur-md">
			{/* Logo */}
			<Link
				className="flex items-center gap-2 font-bold text-lg tracking-tighter"
				href="/"
			>
				<div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary text-primary-foreground">
					<Box className="h-4 w-4" />
				</div>
				<span>PERSONAL DUMP</span>
			</Link>

			{/* Nav Items - Minimal text links */}
			<nav className="flex items-center gap-6">
				{NAV_ITEMS.map((item) => {
					const isActive = pathname === item.href;

					return (
						<Link
							className={cn(
								"group relative font-medium text-sm transition-colors",
								isActive
									? "text-primary"
									: "text-muted-foreground hover:text-foreground",
							)}
							href={item.href}
							key={item.href}
						>
							{item.label}
							<span
								className={cn(
									"absolute -bottom-1 left-0 h-[2px] w-full origin-left bg-primary transition-transform",
									isActive
										? "scale-x-100"
										: "scale-x-0 group-hover:scale-x-100",
								)}
							/>
						</Link>
					);
				})}
			</nav>

			{/* Status Indicator - Minimal Dot */}
			<div className="hidden items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-widest sm:flex">
				<div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
				<span>System Online</span>
			</div>
		</header>
	);
}
