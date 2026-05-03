import { useSelect, useDispatch } from "@wordpress/data";
import { STORE_NAME } from "../store";

/**
 * Panel wrapper fields live on presetsFormData.panel.wrapper.
 */
export const usePresetPanelWrapper = () => {
	const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData(), []);
	const { setPresetsFormData } = useDispatch(STORE_NAME);

	const handleWrapperChange = (key, value) => {
		const prevWrapper = { ...(presetsFormData.panel?.wrapper || {}) };
		if (value === "" || value === null || value === undefined) {
			delete prevWrapper[key];
		} else {
			prevWrapper[key] = value;
		}
		setPresetsFormData({
			...presetsFormData,
			panel: {
				...presetsFormData.panel,
				wrapper: prevWrapper,
			},
		});
	};

	const wrapper = presetsFormData?.panel?.wrapper || {};

	return { wrapper, handleWrapperChange };
};
