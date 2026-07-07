export function normalizeItemLayout(layout, fallback = "block") {
	if (layout === "inline") {
		return "inline";
	}

	if (layout === "default" || layout === "block") {
		return "block";
	}

	return fallback;
}
