import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import FeaturesCustomization from './features-customization';


const FeatureSettings = () => {
    const { WapSwitch, WapTypography } = window?.wapComponents;
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
            <WapTypography.Title level={5}>{__('Feature Customization', 'website-accessibility')}</WapTypography.Title>
            <FeaturesCustomization updateAttr={updateAttr} attributes={attributes} />
            <WapTypography.Title level={5}>{__('Items', 'website-accessibility')}</WapTypography.Title>
            <ControlWrapper
                label={__('Hide Item Icons', 'website-accessibility')}
            >
                <WapSwitch checked={attributes.hideItemIcons} onChange={(checked) => updateAttr({ hideItemIcons: checked })} />
            </ControlWrapper>
            <ControlWrapper
                label={__('Hide Item Labels', 'website-accessibility')}
            >
                <WapSwitch checked={attributes.hideItemLabels} onChange={(checked) => updateAttr({ hideItemLabels: checked })} />
            </ControlWrapper>
        </>
    );
};

export default FeatureSettings;
