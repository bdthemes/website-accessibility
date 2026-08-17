import { getAdminExtensions } from "../../utils/admin-extensions";
import ControlWrapper from "./control-wrapper";

/**
 * Whether an add-on has registered a control for the given slot.
 *
 * @param {string} slot
 * @return {boolean}
 */
export const hasExtensionControl = (slot) => !!getAdminExtensions().controls[slot];

/**
 * Renders a setting row whose control is contributed by an add-on. When no
 * add-on provides a control for the slot, nothing is rendered at all — the
 * free plugin never shows placeholder/disabled controls.
 *
 * Slot components receive whatever extra props the caller passes
 * (typically { attributes, updateAttr }).
 */
const ExtensionControl = ({ slot, label, inline = true, ...props }) => {
	const Control = getAdminExtensions().controls[slot];

	if (!Control) {
		return null;
	}

	if (label) {
		return (
			<ControlWrapper label={label} inline={inline}>
				<Control {...props} />
			</ControlWrapper>
		);
	}

	return <Control {...props} />;
};

export default ExtensionControl;
