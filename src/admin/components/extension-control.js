import { __ } from "@wordpress/i18n";
import { getAdminExtensions } from "../../utils/admin-extensions";

/**
 * Renders a control contributed by an add-on for the given slot; when no add-on
 * provides one, shows a plain "PRO" badge (informational only).
 *
 * Slot components receive { attributes, updateAttr } (or whatever the caller passes).
 */
const ExtensionControl = ({ slot, ...props }) => {
	const { WapBadge } = window?.wapComponents || {};
	const Control = getAdminExtensions().controls[slot];

	if (Control) {
		return <Control {...props} />;
	}

	return WapBadge ? <WapBadge color="gold" count={__("PRO", "website-accessibility")} /> : null;
};

export default ExtensionControl;
