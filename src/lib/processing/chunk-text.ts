/**
 * Splits text into chunks of approximately targetSize characters with overlap.
 * Tries to split at paragraph or sentence boundaries.
 */
export function chunkText(
	text: string,
	targetSize = 2000,
	overlap = 200,
): string[] {
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

		chunks.push(text.substring(startIndex, startIndex + breakIndex).trim());
		startIndex += breakIndex - overlap;

		// Safety check to avoid infinite loop
		if (breakIndex <= overlap) {
			startIndex = startIndex + targetSize;
		}
	}

	return chunks.filter((c) => c.length > 0);
}
