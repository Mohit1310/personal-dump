"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
	ModelSelector,
	ModelSelectorContent,
	ModelSelectorEmpty,
	ModelSelectorGroup,
	ModelSelectorInput,
	ModelSelectorItem,
	ModelSelectorList,
	ModelSelectorLogo,
	ModelSelectorName,
	ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import {
	PromptInput,
	PromptInputBody,
	PromptInputButton,
	PromptInputFooter,
	PromptInputSubmit,
	PromptInputTextarea,
	PromptInputTools,
} from "@/components/ai-elements/prompt-input";

interface ChatInputProps {
	onSubmit: (text: string, modelId: string) => void;
	inputValue: string;
	isModelSelectorOpen: boolean;
	onModelSelectorOpenChange: (isOpen: boolean) => void;
	onInputChange: (value: string) => void;
	status: "submitted" | "streaming" | "ready" | "error";
}

const DEFAULT_MODEL = "qwen/qwen3-32b";
export const CHAT_INPUT_TEXTAREA_ID = "chat-input-textarea";

const ChatInput = ({
	onSubmit,
	inputValue,
	isModelSelectorOpen,
	onModelSelectorOpenChange,
	onInputChange,
	status,
}: ChatInputProps) => {
	const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
	const [availableModels, setAvailableModels] = useState<string[]>([
		DEFAULT_MODEL,
	]);

	useEffect(() => {
		const loadModels = async () => {
			try {
				const response = await fetch("/api/models/groq");
				if (!response.ok) {
					throw new Error(`Failed to load models (${response.status})`);
				}
				const data = (await response.json()) as { models?: string[] };
				if (data.models && data.models.length > 0) {
					setAvailableModels(data.models);
					setSelectedModel((current) =>
						data.models?.includes(current)
							? current
							: (data.models?.[0] ?? DEFAULT_MODEL),
					);
				}
			} catch (error) {
				console.error("Failed to load Groq models:", error);
			}
		};

		loadModels();
	}, []);

	return (
		<div className="size-full">
			<PromptInput
				globalDrop
				multiple
				onSubmit={({ text }: PromptInputMessage) =>
					onSubmit(text, selectedModel)
				}
			>
				<PromptInputBody>
					<PromptInputTextarea
						autoFocus
						id={CHAT_INPUT_TEXTAREA_ID}
						onChange={(e) => onInputChange(e.target.value)}
						placeholder="Enter command or query..."
						value={inputValue}
					/>
				</PromptInputBody>
				<PromptInputFooter>
					<PromptInputTools>
						<ModelSelector
							onOpenChange={onModelSelectorOpenChange}
							open={isModelSelectorOpen}
						>
							<ModelSelectorTrigger asChild>
								<PromptInputButton className="w-full px-2">
									<ModelSelectorName>{selectedModel}</ModelSelectorName>
								</PromptInputButton>
							</ModelSelectorTrigger>
							<ModelSelectorContent>
								<ModelSelectorInput placeholder="Search models..." />
								<ModelSelectorList>
									<ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
									<ModelSelectorGroup heading="Groq Models">
										{availableModels.map((modelId) => (
											<ModelSelectorItem
												key={modelId}
												onSelect={() => {
													setSelectedModel(modelId);
													onModelSelectorOpenChange(false);
												}}
												value={modelId}
											>
												<ModelSelectorLogo provider="groq" />
												<ModelSelectorName>{modelId}</ModelSelectorName>
												{selectedModel === modelId && (
													<Check className="size-4 text-white" />
												)}
											</ModelSelectorItem>
										))}
									</ModelSelectorGroup>
									{/* {["OpenAI", "Anthropic", "Google"].map((chef) => (
										<ModelSelectorGroup heading={chef} key={chef}>
											{models
												.filter((m) => m.chef === chef)
												.map((m) => (
													<ModelItem
														key={m.id}
														m={m}
														onSelect={handleModelSelect}
														selectedModel={model}
													/>
												))}
										</ModelSelectorGroup>
									))} */}
								</ModelSelectorList>
							</ModelSelectorContent>
						</ModelSelector>
					</PromptInputTools>
					<PromptInputSubmit status={status} />
				</PromptInputFooter>
			</PromptInput>
		</div>
	);
};

export default ChatInput;
