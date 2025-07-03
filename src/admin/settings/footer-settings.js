import { useMemo } from '@wordpress/element';
import { Tabs, Collapse, Input, Switch } from 'antd';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';

const FooterSettings = () => {
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
                <Collapse>
                    <Collapse.Panel header={__('Reset Button', 'website-accessibility')} key="reset">
                        <ControlWrapper label={__('Show Reset Button', 'website-accessibility')}>
                            <Switch checked={attributes.showResetBtn !== false} onChange={checked => updateAttr({ showResetBtn: checked })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Reset Button Text', 'website-accessibility')}>
                            <Input
                                value={attributes.resetBtnText || 'Reset All Accessibility Settings'}
                                onChange={e => updateAttr({ resetBtnText: e.target.value })}
                                placeholder={__('Reset All Accessibility Settings', 'website-accessibility')}
                            />
                        </ControlWrapper>
                    </Collapse.Panel>
                    <Collapse.Panel header={__('Save Button', 'website-accessibility')} key="save">
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
                    </Collapse.Panel>
                    <Collapse.Panel header={__('Footer Links', 'website-accessibility')} key="links">
                        <ControlWrapper label={__('Show Accessibility Statement', 'website-accessibility')}>
                            <Switch checked={attributes.showStatement !== false} onChange={checked => updateAttr({ showStatement: checked })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Accessibility Statement Text', 'website-accessibility')}>
                            <Input
                                value={attributes.statementText || 'Accessibility Statement'}
                                onChange={e => updateAttr({ statementText: e.target.value })}
                                placeholder={__('Accessibility Statement', 'website-accessibility')}
                            />
                        </ControlWrapper>
                        <ControlWrapper label={__('Show Branding', 'website-accessibility')}>
                            <Switch checked={attributes.showBranding !== false} onChange={checked => updateAttr({ showBranding: checked })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Branding Text', 'website-accessibility')}>
                            <Input
                                value={attributes.brandingText || 'Proudly Powered by Website Accessibility Pro'}
                                onChange={e => updateAttr({ brandingText: e.target.value })}
                                placeholder={__('Proudly Powered by Website Accessibility Pro', 'website-accessibility')}
                            />
                        </ControlWrapper>
                    </Collapse.Panel>
                </Collapse>
            )
        },
        {
            key: 'style',
            label: __('Style', 'website-accessibility'),
            children: (
                <Collapse>
                    <Collapse.Panel header={__('Reset Button', 'website-accessibility')} key="reset-style">
                        <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.resetBtnBg || '#0073ea'} onChange={e => updateAttr({ resetBtnBg: e.target.value })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Text Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.resetBtnColor || '#fff'} onChange={e => updateAttr({ resetBtnColor: e.target.value })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                            <Input type="number" value={attributes.resetBtnRadius || 16} onChange={e => updateAttr({ resetBtnRadius: e.target.value })} addonAfter="px" />
                        </ControlWrapper>
                    </Collapse.Panel>
                    <Collapse.Panel header={__('Save Button', 'website-accessibility')} key="save-style">
                        <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.saveBtnBg || '#fff'} onChange={e => updateAttr({ saveBtnBg: e.target.value })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Text Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.saveBtnColor || '#111'} onChange={e => updateAttr({ saveBtnColor: e.target.value })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                            <Input type="number" value={attributes.saveBtnRadius || 50} onChange={e => updateAttr({ saveBtnRadius: e.target.value })} addonAfter="px" />
                        </ControlWrapper>
                        <ControlWrapper label={__('Icon Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.saveBtnIconColor || '#0073ea'} onChange={e => updateAttr({ saveBtnIconColor: e.target.value })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Arrow Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.saveBtnArrowColor || '#888'} onChange={e => updateAttr({ saveBtnArrowColor: e.target.value })} />
                        </ControlWrapper>
                    </Collapse.Panel>
                    <Collapse.Panel header={__('Footer Links', 'website-accessibility')} key="links-style">
                        <ControlWrapper label={__('Link Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.linkColor || '#0073ea'} onChange={e => updateAttr({ linkColor: e.target.value })} />
                        </ControlWrapper>
                        <ControlWrapper label={__('Branding Color', 'website-accessibility')}>
                            <Input type="color" value={attributes.brandingColor || '#1a4cd8'} onChange={e => updateAttr({ brandingColor: e.target.value })} />
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
