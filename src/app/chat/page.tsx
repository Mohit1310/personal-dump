import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
	return (
		<main className="relative flex h-screen overflow-hidden bg-background">
			{/* Dynamic background decoration */}
			<div className="pointer-events-none absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[128px]" />
			<div className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent-custom/10 blur-[128px]" />

			<ChatInterface />
		</main>
	);
}
