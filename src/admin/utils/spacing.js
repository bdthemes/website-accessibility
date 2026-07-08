export function parsePxValue(value) {
	if (value === null || value === undefined || value === "") {
		return "";
	}

	const match = String(value).trim().match(/^(-?\d*\.?\d+)/);
	return match ? match[1] : "";
}

export function parseAxisPadding(value) {
	if (!value) {
		return { vertical: "", horizontal: "" };
	}

	const parts = String(value).trim().split(/\s+/);
	return {
		vertical: parsePxValue(parts[0]),
		horizontal: parsePxValue(parts[1] ?? parts[0]),
	};
}

export function formatPxValue(value) {
	if (value === "" || value === null || value === undefined) {
		return "";
	}

	return `${value}px`;
}

export function formatAxisPadding(vertical, horizontal) {
	const v = String(vertical ?? "").trim();
	const h = String(horizontal ?? "").trim();

	if (!v && !h) {
		return "";
	}

	if (v && h) {
		return v === h ? `${v}px` : `${v}px ${h}px`;
	}

	if (v) {
		return `${v}px`;
	}

	return `${h}px`;
}
