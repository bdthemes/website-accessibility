import { useState, useEffect, useMemo } from "@wordpress/element";

export function getWhiteLabelPanelIconUrls() {
	if (typeof window === "undefined") {
		return { header: "", footer: "" };
	}

	const boot =
		window.websiteAccessibility?.whiteLabelBoot ||
		window.websacAdmin?.whiteLabelBoot ||
		null;

	const enabled = !!(
		window.websiteAccessibility?.whiteLabelEnabled ?? boot?.enabled
	);

	if (!enabled || !boot || typeof boot !== "object") {
		return { header: "", footer: "" };
	}

	return {
		header:
			typeof boot.panel_header_icon === "string"
				? boot.panel_header_icon.trim()
				: "",
		footer:
			typeof boot.panel_footer_icon === "string"
				? boot.panel_footer_icon.trim()
				: "",
	};
}

export function useWhiteLabelPanelIconUrls() {
	const [epoch, setEpoch] = useState(0);

	useEffect(() => {
		const onChange = () => setEpoch((n) => n + 1);
		window.addEventListener("websac-white-label-changed", onChange);
		return () => window.removeEventListener("websac-white-label-changed", onChange);
	}, []);

	return useMemo(() => getWhiteLabelPanelIconUrls(), [epoch]);
}
