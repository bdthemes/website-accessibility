import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import FeaturesCustomization from './features-customization';
import PanelItemsSettings from '../components/panel-items-settings';

const FeatureSettings = () => {
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const featureItem = presetsFormData.panel.items.find(item => item.slug === 'features');
    const attributes = featureItem?.attributes || {};

    const updateAttr = (updates) => {
        const updatedItems = presetsFormData.panel.items.map((item) =>
            item.slug === 'features'
                ? { ...item, attributes: { ...attributes, ...updates } }
                : item
        );

        setPresetsFormData({
            ...presetsFormData,
            panel: {
                ...presetsFormData.panel,
                items: updatedItems
            }
        });
    };

    return (
        <>
            <FeaturesCustomization updateAttr={updateAttr} attributes={attributes} />
            <PanelItemsSettings attributes={attributes} updateAttr={updateAttr} />
        </>
    );
};

export default FeatureSettings;
