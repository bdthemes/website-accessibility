import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import FeaturesCustomization from './features-customization';
import { useLicense } from '../context/LicenseContext';


const FeatureSettings = () => {
    const { WapSwitch, WapTypography, WapSelect, WapRadio, WapFlex, WapBadge } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const { isProActive } = useLicense();
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
            <WapTypography.Title level={5} className="wap-features-items-settings__title">{__('Items', 'website-accessibility')}</WapTypography.Title>
            <div className="wap-features-items-settings">
                <ControlWrapper
                    label={__('Hide Item Icons', 'website-accessibility')}
                    inline
                >
                    <WapSwitch checked={attributes.hideItemIcons} onChange={(checked) => updateAttr({ hideItemIcons: checked })} />
                </ControlWrapper>

                <ControlWrapper
                    label={__('Hide Item Labels', 'website-accessibility')}
                    inline
                >
                    <WapSwitch checked={attributes.hideItemLabels} onChange={(checked) => updateAttr({ hideItemLabels: checked })} />
                </ControlWrapper>

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

                <ControlWrapper
                    label={__('Layout', 'website-accessibility')}
                    inline
                >
                    {isProActive ? (
                        <WapFlex vertical gap="middle" style={{ width: "100%" }}>
                            <WapRadio.Group
                                block
                                options={[
                                    { label: __('Default', 'website-accessibility'), value: 'default' },
                                    { label: __('Inline', 'website-accessibility'), value: 'inline' },
                                ]}
                                value={attributes.layout || 'default'}
                                onChange={(e) => updateAttr({ layout: e.target.value })}
                                optionType="button"
                                buttonStyle="solid"
                            />
                        </WapFlex>
                    ) : (
                        <WapBadge color="gold" count={__("PRO", "website-accessibility")} />
                    )}
                </ControlWrapper>

                <ControlWrapper
                    label={__('Tooltip Position', 'website-accessibility')}
                    inline
                >
                    {isProActive ? (
                        <WapSelect
                            value={attributes.tooltipPosition || 'topLeft'}
                            onChange={(value) => updateAttr({ tooltipPosition: value })}
                            style={{ minWidth: 160 }}
                        >
                            <WapSelect.Option value="topLeft">{__('Top Left', 'website-accessibility')}</WapSelect.Option>
                            <WapSelect.Option value="topRight">{__('Top Right', 'website-accessibility')}</WapSelect.Option>
                            <WapSelect.Option value="bottomLeft">{__('Bottom Left', 'website-accessibility')}</WapSelect.Option>
                            <WapSelect.Option value="bottomRight">{__('Bottom Right', 'website-accessibility')}</WapSelect.Option>
                        </WapSelect>
                    ) : (
                        <WapBadge color="gold" count={__("PRO", "website-accessibility")} />
                    )}
                </ControlWrapper>
            </div>
        </>
    );
};

export default FeatureSettings;
