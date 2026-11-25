import { useEffect, useState } from "@wordpress/element";
import { subscribe, getLocaleData, _x } from "@wordpress/i18n";

/**
 * Re-render when translations change at run time.
 *
 * The toolbar's strings are looked up when they are read (feature, profile and
 * category definitions use getters), so a component only has to render again
 * after `wp.i18n.setLocaleData()` / `resetLocaleData()` for its text to follow.
 * Returns a counter that changes on every update, for `useMemo` dependencies.
 */
export const useI18nVersion = () => {
	const [version, setVersion] = useState(0);

	useEffect(() => {
		if (typeof subscribe !== "function") return undefined;
		return subscribe(() => setVersion((value) => value + 1));
	}, []);

	return version;
};

/**
 * Text direction of the toolbar's own language, from the loaded translation of
 * this plugin (translators set the "text direction" string to "rtl" for Hebrew,
 * Arabic…, an add-on loading English sets it to "ltr"). Undefined when the
 * translation does not say, so the toolbar keeps the page's direction.
 */
export const getToolbarDirection = () => {
	const data = typeof getLocaleData === "function" ? getLocaleData("website-accessibility") : null;
	if (!data?.["text direction\u0004ltr"]?.[0]) {
		return undefined;
	}
	const value = _x("ltr", "text direction", "website-accessibility");
	return value === "rtl" || value === "ltr" ? value : undefined;
};
