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
	const fencedRanges = findFencedRanges(text);
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
		const endingFence = findContainingRange(fencedRanges, chunkEndIndex);
		if (endingFence) {
			const [, fenceEndIndex] = endingFence;
			chunkEndIndex = fenceEndIndex;
		}

		chunks.push(text.substring(startIndex, chunkEndIndex));
		if (chunkEndIndex >= text.length) {
			break;
		}

		let nextStartIndex = chunkEndIndex - overlap;
		const overlappingFence = findContainingRange(fencedRanges, nextStartIndex);
		if (overlappingFence) {
			const [fenceStartIndex] = overlappingFence;
			nextStartIndex = fenceStartIndex;
		}

		if (nextStartIndex > startIndex) {
			startIndex = nextStartIndex;
		} else {
			startIndex = chunkEndIndex;
		}
	}

	return chunks.filter((chunk) => chunk.length > 0);
}

function findFencedRanges(text: string): [number, number][] {
	const ranges: [number, number][] = [];
	let openingIndex: number | undefined = undefined;
	let searchIndex = 0;

	while (true) {
		const fenceIndex = text.indexOf("```", searchIndex);
		if (fenceIndex === -1) {
			break;
		}

		if (openingIndex === undefined) {
			openingIndex = fenceIndex;
		} else {
			ranges.push([openingIndex, fenceIndex + 3]);
			openingIndex = undefined;
		}
		searchIndex = fenceIndex + 3;
	}

	if (openingIndex !== undefined) {
		ranges.push([openingIndex, text.length]);
	}

	return ranges;
}

function findContainingRange(
	ranges: [number, number][],
	position: number,
): [number, number] | undefined {
	let low = 0;
	let high = ranges.length - 1;

	while (low <= high) {
		const middle = Math.floor((low + high) / 2);
		const range = ranges[middle];
		if (!range) {
			break;
		}

		const [rangeStart, rangeEnd] = range;
		if (position <= rangeStart) {
			high = middle - 1;
		} else if (position >= rangeEnd) {
			low = middle + 1;
		} else {
			return range;
		}
	}
}
