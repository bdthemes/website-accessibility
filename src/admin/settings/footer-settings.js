import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import ColorPicker from '../controls/color-picker';

const FooterSettings = () => {
    const { WapTabs, WapInput, WapSwitch, WapTypography, WapRow, WapCol } = window?.wapComponents;
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

    const tabItems = [
        {
            key: 'content',
            label: __('Content', 'website-accessibility'),
            children: (
                <div className="wap-footer-settings">
                    <WapTypography.Title level={5} className="wap-footer-settings__section-title">{__('Preference Button', 'website-accessibility')}</WapTypography.Title>
                    <WapRow gutter={[16, 12]}>
                        <WapCol xs={24} md={24} style={{ marginBottom: '10px' }}>
                            <ControlWrapper label={__('Active Preference', 'website-accessibility')} inline>
                                <WapSwitch checked={attributes.activePreference || false} onChange={checked => updateAttr({ activePreference: checked })} />
                            </ControlWrapper>
                        </WapCol>
                    </WapRow>
                    <WapTypography.Title level={5} className="wap-footer-settings__section-title">{__('Footer Text', 'website-accessibility')}</WapTypography.Title>
                    <WapRow gutter={[16, 12]}>
                        <WapCol xs={24} md={12}>
                            <ControlWrapper label={__('Show Accessibility Statement', 'website-accessibility')} inline>
                                <WapSwitch checked={attributes.showStatement !== false} onChange={checked => updateAttr({ showStatement: checked })} />
                            </ControlWrapper>
                        </WapCol>
                        <WapCol xs={24} md={12}>
                            <ControlWrapper label={__('Show Branding', 'website-accessibility')} inline>
                                <WapSwitch checked={attributes.showBranding !== false} onChange={checked => updateAttr({ showBranding: checked })} />
                            </ControlWrapper>
                        </WapCol>
                    </WapRow>
                </div>
            )
        },
        {
            key: 'style',
            label: __('Style', 'website-accessibility'),
            children: (
                <div className="wap-footer-settings">
                    <WapTypography.Title level={5} className="wap-footer-settings__section-title">{__('General', 'website-accessibility')}</WapTypography.Title>
                    <WapRow gutter={[16, 8]}>
                        <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                                <ColorPicker
                                    value={attributes.generalBg}
                                    onChange={value => updateAttr({ generalBg: value })}
                                />
                            </ControlWrapper>
                        </WapCol>
                        {/* <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Padding', 'website-accessibility')}>
                                <WapInput
                                    value={attributes.generalPadding}
                                    onChange={e => updateAttr({ generalPadding: e.target.value })}
                                    placeholder="10px 20px"
                                />
                            </ControlWrapper>
                        </WapCol> */}
                        {/* <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                                <WapInput value={attributes.generalRadius || `0 0 16px 16px`} onChange={e => updateAttr({ generalRadius: e.target.value })} />
                            </ControlWrapper>
                        </WapCol> */}
                    </WapRow>

                    {/* <WapTypography.Title level={5} className="wap-footer-settings__section-title">{__('Reset Button', 'website-accessibility')}</WapTypography.Title>
                    <WapRow gutter={[16, 8]}>
                        <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                                <ColorPicker
                                    value={attributes.resetBtnBg}
                                    onChange={value => updateAttr({ resetBtnBg: value })}
                                />
                            </ControlWrapper>
                        </WapCol>
                        <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Text Color', 'website-accessibility')}>
                                <ColorPicker
                                    value={attributes.resetBtnColor}
                                    onChange={value => updateAttr({ resetBtnColor: value })}
                                />
                            </ControlWrapper>
                        </WapCol>
                        {/* <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                                <WapInput value={attributes.resetBtnRadius} onChange={e => updateAttr({ resetBtnRadius: e.target.value })} placeholder="6px" />
                            </ControlWrapper>
                        </WapCol>
                        <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Font Size', 'website-accessibility')}>
                                <WapInput value={attributes.resetBtnFontSize} onChange={e => updateAttr({ resetBtnFontSize: e.target.value })} placeholder="14px" />
                            </ControlWrapper>
                        </WapCol>
                        <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Font Weight', 'website-accessibility')}>
                                <WapInput value={attributes.resetBtnFontWeight} onChange={e => updateAttr({ resetBtnFontWeight: e.target.value })} placeholder="500" />
                            </ControlWrapper>
                        </WapCol> */}
                    {/* </WapRow> */}

                    <WapTypography.Title level={5} className="wap-footer-settings__section-title">{__('Footer Text', 'website-accessibility')}</WapTypography.Title>
                    <WapRow gutter={[16, 8]}>
                        <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Link Color', 'website-accessibility')}>
                                <ColorPicker
                                    value={attributes.linkColor}
                                    onChange={value => updateAttr({ linkColor: value })}
                                />
                            </ControlWrapper>
                        </WapCol>
                        <WapCol xs={24} md={8}>
                            <ControlWrapper label={__('Branding Color', 'website-accessibility')}>
                                <ColorPicker
                                    value={attributes.brandingColor}
                                    onChange={value => updateAttr({ brandingColor: value })}
                                />
                            </ControlWrapper>
                        </WapCol>
                    </WapRow>
                </div>
            )
        }
    ];

    return (
        <WapTabs defaultActiveKey="content" items={tabItems} />
    );
};

export default FooterSettings;
