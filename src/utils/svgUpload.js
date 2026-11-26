/**
 * Shared SVG file helpers (profiles, white label, etc.).
 */

/**
 * SVG elements an icon may use. Anything else is removed with everything inside
 * it: script, style (it would restyle the whole page), foreignObject, image, a,
 * animate/set (they can rewrite attributes after sanitizing), title and desc
 * (HTML integration points, where HTML parses again).
 */
const SVG_ALLOWED_ELEMENTS = new Set([
	"svg",
	"g",
	"path",
	"circle",
	"ellipse",
	"line",
	"polyline",
	"polygon",
	"rect",
	"defs",
	"clippath",
	"mask",
	"lineargradient",
	"radialgradient",
	"stop",
	"symbol",
	"use",
]);

/** Presentational attributes (lower case). Event handlers are never on this list. */
const SVG_ALLOWED_ATTRIBUTES = new Set([
	"xmlns",
	"xmlns:xlink",
	"version",
	"width",
	"height",
	"viewbox",
	"preserveaspectratio",
	"x",
	"y",
	"x1",
	"y1",
	"x2",
	"y2",
	"cx",
	"cy",
	"r",
	"rx",
	"ry",
	"fx",
	"fy",
	"d",
	"points",
	"pathlength",
	"fill",
	"fill-rule",
	"fill-opacity",
	"clip-rule",
	"clip-path",
	"clippathunits",
	"mask",
	"maskunits",
	"maskcontentunits",
	"stroke",
	"stroke-width",
	"stroke-linecap",
	"stroke-linejoin",
	"stroke-miterlimit",
	"stroke-dasharray",
	"stroke-dashoffset",
	"stroke-opacity",
	"opacity",
	"transform",
	"gradientunits",
	"gradienttransform",
	"spreadmethod",
	"offset",
	"stop-color",
	"stop-opacity",
	"color",
	"display",
	"visibility",
	"vector-effect",
	"shape-rendering",
	"id",
	"class",
	"style",
	"role",
	"aria-hidden",
	"aria-label",
	"focusable",
	"href",
	"xlink:href",
]);

/** Longest markup accepted, so a stored icon cannot balloon the page. */
const SVG_MAX_LENGTH = 100000;

/**
 * Whether an attribute value is safe to keep. References may only point inside
 * the icon (`#id`, `url(#id)`): no scripts, no requests to other hosts.
 *
 * @param {string} name  Attribute name, lower case.
 * @param {string} value Attribute value.
 * @return {boolean} Whether the value may stay.
 */
function isSafeSvgAttributeValue(name, value) {
	// Browsers ignore whitespace and control characters inside a URL scheme.
	const compact = String(value).replace(/[\s\u0000-\u001f]+/g, "").toLowerCase();

	if (name === "href" || name === "xlink:href") {
		return /^#[\w.:-]+$/.test(compact);
	}

	if (/javascript:|vbscript:|data:|expression\(|@import|\\|<|behavior:|-moz-binding/.test(compact)) {
		return false;
	}

	if (compact.includes("url(")) {
		// Only references to elements of this icon, e.g. fill="url(#gradient)".
		return compact.replace(/url\(['"]?#[\w.:-]+['"]?\)/g, "").indexOf("url(") === -1;
	}

	return true;
}

/**
 * Keep only the safe parts of an SVG icon: the elements and attributes listed
 * above, with references that stay inside the icon. Returns the cleaned markup,
 * or an empty string when the input is not an `<svg>` element.
 *
 * Parsed with the HTML parser, the same one that reads the markup when it is put
 * on the page, so what is checked here is exactly what the page gets. Documents
 * made by DOMParser are inert: nothing in them runs or loads while checking.
 *
 * @param {string} markup SVG markup.
 * @return {string} Clean SVG markup, or '' when there is no usable SVG.
 */
export function sanitizeSvgMarkup(markup) {
	if (typeof markup !== "string" || typeof window === "undefined" || typeof window.DOMParser !== "function") {
		return "";
	}

	const source = markup.trim();
	if (!source || source.length > SVG_MAX_LENGTH) {
		return "";
	}

	let doc;
	try {
		doc = new window.DOMParser().parseFromString(`<!DOCTYPE html><body>${source}`, "text/html");
	} catch {
		return "";
	}

	const root = doc?.body?.firstElementChild;
	if (!root || root.localName !== "svg" || doc.body.childElementCount !== 1) {
		return "";
	}

	const clean = (element) => {
		// Children first, on a copy: removing nodes while walking a live list skips some.
		Array.from(element.childNodes).forEach((child) => {
			if (child.nodeType === 3) {
				return; // Text is escaped when serialized.
			}
			if (child.nodeType !== 1 || !SVG_ALLOWED_ELEMENTS.has(child.localName.toLowerCase())) {
				child.remove(); // Comments, CDATA, processing instructions, unknown elements.
				return;
			}
			clean(child);
		});

		Array.from(element.attributes).forEach((attribute) => {
			const name = attribute.name.toLowerCase();
			if (
				name.startsWith("on") ||
				!SVG_ALLOWED_ATTRIBUTES.has(name) ||
				!isSafeSvgAttributeValue(name, attribute.value)
			) {
				element.removeAttribute(attribute.name);
			}
		});
	};

	clean(root);

	return root.outerHTML;
}

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
			// Only the safe part of an uploaded file is kept, so what is stored is
			// what will be shown.
			const markup = sanitizeSvgMarkup(extractSvgMarkupFromText(text) || "");
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
