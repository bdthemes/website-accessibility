import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import FeaturesCustomization from './features-customization';


const FeatureSettings = () => {
    const { WapSwitch, WapTypography, WapSelect, WapRow, WapCol } = window?.wapComponents;
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
            <WapTypography.Title level={5}>{__('Items', 'website-accessibility')}</WapTypography.Title>
            <WapRow gutter={[16, 16]}>
                <WapCol md={12}>
                    <ControlWrapper
                        label={__('Hide Item Icons', 'website-accessibility')}
                        inline
                    >
                        <WapSwitch checked={attributes.hideItemIcons} onChange={(checked) => updateAttr({ hideItemIcons: checked })} />
                    </ControlWrapper>
                </WapCol>
                <WapCol md={12}>
                    <ControlWrapper
                        label={__('Hide Item Labels', 'website-accessibility')}
                        inline
                    >
                        <WapSwitch checked={attributes.hideItemLabels} onChange={(checked) => updateAttr({ hideItemLabels: checked })} />
                    </ControlWrapper>
                </WapCol>
                <WapCol md={12}>
                    <ControlWrapper
                        label={__('Columns', 'website-accessibility')}
                        inline
                    >
                        <WapSelect
                            value={String(attributes.columns || 2)}
                            onChange={(value) => updateAttr({ columns: Number(value) })}
                            style={{ minWidth: 120 }}
                        >
                            {[1, 2, 3, 4, 5, 6].map((count) => (
                                <WapSelect.Option key={count} value={String(count)}>
                                    {count}
                                </WapSelect.Option>
                            ))}
                        </WapSelect>
                    </ControlWrapper>
                </WapCol>
            </WapRow>
        </>
    );
};

export default FeatureSettings;
