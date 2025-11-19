import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import ColorPicker from '../controls/color-picker';

const FooterSettings = () => {
    const { WapTabs, WapInput, WapSwitch, WapCollapse } = window?.wapComponents;
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const footerItem = presetsFormData.panel.items.find(item => item.slug === 'footer');
    const attributes = footerItem?.attributes || {};
    const isProActive = window?.websacPro?.isProActive || false;

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
                <WapCollapse                                                
                    items={[
                        {
                            key: 'reset',
                            label: __('Reset Button', 'website-accessibility'),
                            children: (
                                <ControlWrapper label={__('Reset Button Text', 'website-accessibility')}>
                                    <WapInput
                                        value={attributes.resetBtnText || ''}
                                        onChange={e => updateAttr({ resetBtnText: e.target.value })}
                                        placeholder={__('Reset All', 'website-accessibility')}
                                    />
                                </ControlWrapper>
                            )
                        },
                        {
                            key: 'preference',
                            label: __('Preference Button', 'website-accessibility'),
                            children: (
                                <>
                                    <ControlWrapper label={__('Active Preference', 'website-accessibility')}>
                                        <WapSwitch checked={attributes.activePreference || false} onChange={checked => updateAttr({ activePreference: checked })} />
                                    </ControlWrapper>
                                    {
                                        attributes?.activePreference && (
                                            <>
                                                <ControlWrapper label={__('Save button text', 'website-accessibility')}>
                                                    <WapInput
                                                        value={attributes.saveBtnText || ''}
                                                        onChange={e => updateAttr({ saveBtnText: e.target.value })}
                                                        placeholder={__('Save Pref.', 'website-accessibility')}
                                                    />
                                                </ControlWrapper>
                                                <ControlWrapper label={__('Update button text', 'website-accessibility')}>
                                                    <WapInput
                                                        value={attributes.updateBtnText || ''}
                                                        onChange={e => updateAttr({ updateBtnText: e.target.value })}
                                                        placeholder={__('Update Preference', 'website-accessibility')}
                                                    />
                                                </ControlWrapper>
                                                <ControlWrapper label={__('Delete button text', 'website-accessibility')}>
                                                    <WapInput
                                                        value={attributes.deleteBtnText || ''}
                                                        onChange={e => updateAttr({ deleteBtnText: e.target.value })}
                                                        placeholder={__('Delete Preference', 'website-accessibility')}
                                                    />
                                                </ControlWrapper>
                                            </>
                                        )
                                    }
                                </>
                            )
                        },
                        {
                            key: 'links',
                            label: __('Footer Text', 'website-accessibility'),
                            children: (
                                <>
                                    <ControlWrapper label={__('Show Accessibility Statement', 'website-accessibility')}>
                                        <WapSwitch checked={attributes.showStatement !== false} onChange={checked => updateAttr({ showStatement: checked })} />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Accessibility Statement Text', 'website-accessibility')}>
                                        <WapInput
                                            value={attributes.statementText}
                                            onChange={e => updateAttr({ statementText: e.target.value })}
                                            placeholder={__('Accessibility Statement', 'website-accessibility')}
                                        />
                                    </ControlWrapper>
                                    {
                                        isProActive && (
                                            <>
                                                <ControlWrapper label={__('Show Branding', 'website-accessibility')}>
                                                    <WapSwitch checked={attributes.showBranding !== false} onChange={checked => updateAttr({ showBranding: checked })} />
                                                </ControlWrapper>
                                                {
                                                    attributes.showBranding !== false && (
                                                        <ControlWrapper label={__('Branding Text', 'website-accessibility')}>
                                                            <WapInput
                                                                value={attributes.brandingText}
                                                                onChange={e => updateAttr({ brandingText: e.target.value })}
                                                                placeholder={__('Proudly Powered by One Accessibility', 'website-accessibility')}
                                                            />
                                                        </ControlWrapper>
                                                    )
                                                }
                                            </>
                                        )
                                    }
                                </>
                            )
                        }
                    ]}
                />
            )
        },
        {
            key: 'style',
            label: __('Style', 'website-accessibility'),
            children: (
                <WapCollapse
                    items={[
                        {
                            key: 'general',
                            label: __('General', 'website-accessibility'),
                            children: (
                                <>
                                    <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                                        <ColorPicker
                                            value={attributes.generalBg}
                                            onChange={value => updateAttr({ generalBg: value })}
                                        />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Padding', 'website-accessibility')}>
                                        <WapInput
                                            value={attributes.generalPadding}
                                            onChange={e => updateAttr({ generalPadding: e.target.value })}
                                            placeholder="10px 20px"
                                        />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                                        <WapInput value={attributes.generalRadius || `0 0 16px 16px`} onChange={e => updateAttr({ generalRadius: e.target.value })} />
                                    </ControlWrapper>
                                </>
                            )
                        },
                        {
                            key: 'reset-style',
                            label: __('Reset Button', 'website-accessibility'),
                            children: (
                                <>
                                    <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                                        <ColorPicker
                                            value={attributes.resetBtnBg}
                                            onChange={value => updateAttr({ resetBtnBg: value })}
                                        />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Text Color', 'website-accessibility')}>
                                        <ColorPicker
                                            value={attributes.resetBtnColor}
                                            onChange={value => updateAttr({ resetBtnColor: value })}
                                        />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                                        <WapInput value={attributes.resetBtnRadius} onChange={e => updateAttr({ resetBtnRadius: e.target.value })} placeholder="6px" />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Font Size', 'website-accessibility')}>
                                        <WapInput value={attributes.resetBtnFontSize} onChange={e => updateAttr({ resetBtnFontSize: e.target.value })} placeholder="14px" />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Font Weight', 'website-accessibility')}>
                                        <WapInput value={attributes.resetBtnFontWeight} onChange={e => updateAttr({ resetBtnFontWeight: e.target.value })} placeholder="500" />
                                    </ControlWrapper>
                                </>
                            )
                        },
                        {
                            key: 'links-style',
                            label: __('Footer Text', 'website-accessibility'),
                            children: (
                                <>
                                    <ControlWrapper label={__('Link Color', 'website-accessibility')}>
                                        <ColorPicker
                                            value={attributes.linkColor}
                                            onChange={value => updateAttr({ linkColor: value })}
                                        />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Branding Color', 'website-accessibility')}>
                                        <ColorPicker
                                            value={attributes.brandingColor}
                                            onChange={value => updateAttr({ brandingColor: value })}
                                        />
                                    </ControlWrapper>
                                </>
                            )
                        }
                    ]}
                />
            )
        }
    ];

    return (
        <WapTabs defaultActiveKey="content" items={tabItems} />
    );
};

export default FooterSettings;