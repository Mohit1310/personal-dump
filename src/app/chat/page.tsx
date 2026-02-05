import { ChatInterface } from "@/components/chat/ChatInterface";

export default function ChatPage() {
	return (
		<main className="relative h-screen overflow-hidden bg-background pt-16 text-foreground">
			<div className="absolute inset-0 -z-10 bg-grid-pattern opacity-10" />
			<ChatInterface />
		</main>
	);
}
