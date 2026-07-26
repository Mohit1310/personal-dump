/**
 * Splits text into chunks of approximately targetSize characters with overlap.
 * Tries to split at paragraph or sentence boundaries.
 */
export function chunkText(
	text: string,
	targetSize = 2000,
	overlap = 200,
): string[] {
	if (!Number.isInteger(targetSize) || targetSize <= 0) {
		throw new RangeError("targetSize must be a positive integer");
	}
	if (!Number.isInteger(overlap) || overlap < 0 || overlap >= targetSize) {
		throw new RangeError("overlap must be an integer from 0 to targetSize - 1");
	}

	if (text.length <= targetSize) {
		return [text];
	}

	const chunks: string[] = [];
	let startIndex = 0;

	while (startIndex < text.length) {
		const endIndex = startIndex + targetSize;

		if (endIndex >= text.length) {
			chunks.push(text.substring(startIndex));
			break;
		}

		// Try to find a good breaking point (double newline > newline > period)
		const subText = text.substring(startIndex, endIndex + overlap);
		let breakIndex = -1;

		// Look for paragraph break
		const lastDoubleNewline = subText.lastIndexOf("\n\n", targetSize + overlap);
		if (lastDoubleNewline > targetSize * 0.5) {
			breakIndex = lastDoubleNewline + 2;
		} else {
			// Look for newline
			const lastNewline = subText.lastIndexOf("\n", targetSize + overlap);
			if (lastNewline > targetSize * 0.7) {
				breakIndex = lastNewline + 1;
			} else {
				// Look for sentence end
				const lastPeriod = subText.lastIndexOf(". ", targetSize + overlap);
				if (lastPeriod > targetSize * 0.7) {
					breakIndex = lastPeriod + 2;
				} else {
					// Fallback to targetSize
					breakIndex = targetSize;
				}
			}
		}

		let chunkEndIndex = startIndex + breakIndex;
		if (fenceAt(text, chunkEndIndex)) {
			const closingFence = text.indexOf("```", chunkEndIndex);
			if (closingFence !== -1) chunkEndIndex = closingFence + 3;
		}

		chunks.push(text.substring(startIndex, chunkEndIndex));
		startIndex = chunkEndIndex - overlap;
		const openingFence = text.lastIndexOf("```", startIndex);
		const closingFence = text.lastIndexOf("```", startIndex + 1);
		if (openingFence > closingFence && openingFence >= 0) {
			startIndex = openingFence;
		}

		// Safety check to avoid infinite loop
	}

	return chunks.filter((c) => c.length > 0);
}

function fenceAt(text: string, position: number): boolean {
	return (text.substring(0, position).match(/```/g)?.length ?? 0) % 2 === 1;
}
