import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import ColorPicker from '../controls/color-picker';

const FooterSettings = () => {
    const { WapSwitch, WapTypography } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const footerItem = presetsFormData.panel.items.find(item => item.slug === 'footer');
    const attributes = footerItem?.attributes || {};

    const updateAttr = (updates) => {
        const updatedItems = presetsFormData.panel.items.map((item) =>
            item.slug === 'footer'
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
        <div className="wap-footer-settings">
            <div className="wap-footer-settings__grid">
                <ControlWrapper label={__('Active Preference', 'website-accessibility')} inline>
                    <WapSwitch checked={attributes.activePreference || false} onChange={(checked) => updateAttr({ activePreference: checked })} />
                </ControlWrapper>
                <ControlWrapper label={__('Show Accessibility Statement', 'website-accessibility')} inline>
                    <WapSwitch checked={attributes.showStatement !== false} onChange={(checked) => updateAttr({ showStatement: checked })} />
                </ControlWrapper>
                <ControlWrapper label={__('Show Branding', 'website-accessibility')} inline>
                    <WapSwitch checked={attributes.showBranding !== false} onChange={(checked) => updateAttr({ showBranding: checked })} />
                </ControlWrapper>
            </div>

            {attributes.activePreference ? (
                <>
                    <WapTypography.Title level={5} className="wap-footer-settings__section-title">
                        {__('Save preference button', 'website-accessibility')}
                    </WapTypography.Title>
                    <div className="wap-footer-settings__grid">
                        <ControlWrapper label={__('Background', 'website-accessibility')}>
                            <ColorPicker
                                value={attributes.preferenceSaveBg}
                                onChange={(value) => updateAttr({ preferenceSaveBg: value })}
                            />
                        </ControlWrapper>
                        <ControlWrapper label={__('Text & icon', 'website-accessibility')}>
                            <ColorPicker
                                value={attributes.preferenceSaveColor}
                                onChange={(value) => updateAttr({ preferenceSaveColor: value })}
                            />
                        </ControlWrapper>
                        <ControlWrapper label={__('Border', 'website-accessibility')}>
                            <ColorPicker
                                value={attributes.preferenceSaveBorderColor}
                                onChange={(value) => updateAttr({ preferenceSaveBorderColor: value })}
                            />
                        </ControlWrapper>
                    </div>
                    <WapTypography.Title level={5} className="wap-footer-settings__section-title">
                        {__('Delete preference button', 'website-accessibility')}
                    </WapTypography.Title>
                    <div className="wap-footer-settings__grid">
                        <ControlWrapper label={__('Background', 'website-accessibility')}>
                            <ColorPicker
                                value={attributes.preferenceDeleteBg}
                                onChange={(value) => updateAttr({ preferenceDeleteBg: value })}
                            />
                        </ControlWrapper>
                        <ControlWrapper label={__('Text & icon', 'website-accessibility')}>
                            <ColorPicker
                                value={attributes.preferenceDeleteColor}
                                onChange={(value) => updateAttr({ preferenceDeleteColor: value })}
                            />
                        </ControlWrapper>
                        <ControlWrapper label={__('Border', 'website-accessibility')}>
                            <ColorPicker
                                value={attributes.preferenceDeleteBorderColor}
                                onChange={(value) => updateAttr({ preferenceDeleteBorderColor: value })}
                            />
                        </ControlWrapper>
                    </div>
                </>
            ) : null}
            <WapTypography.Title level={5} className="wap-footer-settings__section-title">
                {__('Footer area', 'website-accessibility')}
            </WapTypography.Title>
            <div className="wap-footer-settings__grid">
                <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                    <ColorPicker
                        value={attributes.generalBg}
                        onChange={(value) => updateAttr({ generalBg: value })}
                    />
                </ControlWrapper>
                <ControlWrapper label={__('Link Color', 'website-accessibility')}>
                    <ColorPicker
                        value={attributes.linkColor}
                        onChange={(value) => updateAttr({ linkColor: value })}
                    />
                </ControlWrapper>
                <ControlWrapper label={__('Branding Color', 'website-accessibility')}>
                    <ColorPicker
                        value={attributes.brandingColor}
                        onChange={(value) => updateAttr({ brandingColor: value })}
                    />
                </ControlWrapper>
            </div>
        </div>
    );
};

export default FooterSettings;
