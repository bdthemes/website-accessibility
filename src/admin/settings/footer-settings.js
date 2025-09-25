import { Tabs, Collapse, Input, Switch } from 'antd';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import ColorPicker from '../controls/color-picker';

const FooterSettings = () => {
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
                <Collapse>
                    <Collapse.Panel header={__('Reset Button', 'website-accessibility')} key="reset">
                        <ControlWrapper label={__('Reset Button Text', 'website-accessibility')}>
                            <Input
                                value={attributes.resetBtnText || ''}
                                onChange={e => updateAttr({ resetBtnText: e.target.value })}
                                placeholder={__('Reset All', 'website-accessibility')}
                            />
                        </ControlWrapper>
                    </Collapse.Panel>
                    {/* <Collapse.Panel header={__('Save Button', 'website-accessibility')} key="save">
                        <ControlWrapper label={__('Show Save Button', 'website-accessibility')}>
                            <Switch checked={attributes.showSaveBtn !== false} onChange={checked => updateAttr({ showSaveBtn: checked })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Save Button Text', 'website-accessibility')}>
                            <Input
                                value={attributes.saveBtnText || 'Save Preference'}
                                onChange={e => updateAttr({ saveBtnText: e.target.value })}
                                placeholder={__('Save Preference', 'website-accessibility')}
                            />
                        </ControlWrapper>
                    </Collapse.Panel> */}
                    <Collapse.Panel header={__('Footer Links', 'website-accessibility')} key="links">
                        <ControlWrapper label={__('Show Accessibility Statement', 'website-accessibility')}>
                            <Switch checked={attributes.showStatement !== false} onChange={checked => updateAttr({ showStatement: checked })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Accessibility Statement Text', 'website-accessibility')}>
                            <Input
                                value={attributes.statementText}
                                onChange={e => updateAttr({ statementText: e.target.value })}
                                placeholder={__('Accessibility Statement', 'website-accessibility')}
                            />
                        </ControlWrapper>
                        {
                            isProActive && (
                                <>
                                    <ControlWrapper label={__('Show Branding', 'website-accessibility')}>
                                        <Switch checked={attributes.showBranding !== false} onChange={checked => updateAttr({ showBranding: checked })} />
                                    </ControlWrapper>
                                    <ControlWrapper label={__('Branding Text', 'website-accessibility')}>
                                        <Input
                                            value={attributes.brandingText}
                                            onChange={e => updateAttr({ brandingText: e.target.value })}
                                            placeholder={__('Proudly Powered by Sigmally Website Accessibility', 'website-accessibility')}
                                        />
                                    </ControlWrapper>
                                </>
                            )
                        }
                    </Collapse.Panel>
                </Collapse>
            )
        },
        {
            key: 'style',
            label: __('Style', 'website-accessibility'),
            children: (
                <Collapse>
                    <Collapse.Panel header={__('General', 'website-accessibility')} key="general">
                        <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                            <ColorPicker
                                value={attributes.generalBg}
                                onChange={value => updateAttr({ generalBg: value })}
                            />
                        </ControlWrapper>
                        <ControlWrapper label={__('Padding', 'website-accessibility')}>
                            <Input
                                value={attributes.generalPadding}
                                onChange={e => updateAttr({ generalPadding: e.target.value })}
                                placeholder="10px 20px"
                            />
                        </ControlWrapper>
                        <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                            <Input value={attributes.generalRadius || `0 0 16px 16px`} onChange={e => updateAttr({ generalRadius: e.target.value })} />
                        </ControlWrapper>
                    </Collapse.Panel>
                    <Collapse.Panel header={__('Reset Button', 'website-accessibility')} key="reset-style">
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
                            <Input value={attributes.resetBtnRadius} onChange={e => updateAttr({ resetBtnRadius: e.target.value })} placeholder="6px" />
                        </ControlWrapper>
                    </Collapse.Panel>
                    <Collapse.Panel header={__('Footer Links', 'website-accessibility')} key="links-style">
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
                    </Collapse.Panel>
                </Collapse>
            )
        }
    ];

    return (
        <Tabs defaultActiveKey="content" items={tabItems} />
    );
};

export default FooterSettings;
