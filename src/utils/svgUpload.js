/**
 * Shared SVG file helpers (profiles, white label, etc.).
 */

export function extractSvgMarkupFromText(text = "") {
	if (!text || typeof text !== "string") {
		return null;
	}

	const svgMatch = text.match(/<svg[\s\S]*<\/svg>/i);
	return svgMatch ? svgMatch[0] : null;
}

export function isSvgFile(file) {
	return file?.type === "image/svg+xml" || /\.svg$/i.test(file?.name || "");
}

export function readSvgFileAsMarkup(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();

		reader.onload = () => {
			const text = typeof reader.result === "string" ? reader.result : "";
			const markup = extractSvgMarkupFromText(text);
			if (!markup) {
				reject(new Error("invalid-svg"));
				return;
			}
			resolve(markup);
		};

		reader.onerror = () => reject(new Error("read-failed"));
		reader.readAsText(file);
	});
}

export function svgMarkupToDataUri(markup) {
	const normalized = String(markup || "").trim();
	if (!normalized) {
		return "";
	}

	if (typeof window !== "undefined" && typeof window.btoa === "function") {
		return `data:image/svg+xml;base64,${window.btoa(
			unescape(encodeURIComponent(normalized))
		)}`;
	}

	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalized)}`;
}

export function isSvgAssetUrl(url) {
	return (
		typeof url === "string" &&
		(url.startsWith("data:image/svg+xml") || /\.svg($|\?)/i.test(url))
	);
}
