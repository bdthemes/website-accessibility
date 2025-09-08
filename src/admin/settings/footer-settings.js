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

    const contentCollapseItems = [
        {
            key: 'reset',
            label: __('Reset Button', 'website-accessibility'),
            children: (
                <ControlWrapper label={__('Reset Button Text', 'website-accessibility')}>
                    <Input
                        value={attributes.resetBtnText || ''}
                        onChange={e => updateAttr({ resetBtnText: e.target.value })}
                        placeholder={__('Reset All', 'website-accessibility')}
                    />
                </ControlWrapper>
            ),
        },
        {
            key: 'links',
            label: __('Footer Links', 'website-accessibility'),
            children: (
                <>
                    <ControlWrapper label={__('Show Branding Title', 'website-accessibility')}>
                        <Switch
                            checked={attributes.showStatement !== false}
                            onChange={checked => updateAttr({ showStatement: checked })}
                        />
                    </ControlWrapper>
                    <ControlWrapper label={__('Branding Title', 'website-accessibility')}>
                        <Input
                            value={attributes.statementText || 'Website Accessibility'}
                            onChange={e => updateAttr({ statementText: e.target.value })}
                            placeholder={__('Accessibility Statement', 'website-accessibility')}
                        />
                    </ControlWrapper>
                    <ControlWrapper label={__('Branding Link', 'website-accessibility')}>
                        <Input
                            value={attributes.statementLink || ''}
                            onChange={e => updateAttr({ statementLink: e.target.value })}
                            placeholder='https://bdthemes.com/'
                        />
                    </ControlWrapper>
                    <ControlWrapper label={__('Show Branding Text', 'website-accessibility')}>
                        <Switch
                            checked={attributes.showBranding !== false}
                            onChange={checked => updateAttr({ showBranding: checked })}
                        />
                    </ControlWrapper>
                    <ControlWrapper label={__('Branding Text', 'website-accessibility')}>
                        <Input
                            value={attributes.brandingText || 'Proudly Powered by Website Accessibility'}
                            onChange={e => updateAttr({ brandingText: e.target.value })}
                            placeholder={__('Proudly Powered by Website Accessibility', 'website-accessibility')}
                        />
                    </ControlWrapper>
                </>
            ),
        },
    ];

    const styleCollapseItems = [
        {
            key: 'general',
            label: __('General', 'website-accessibility'),
            children: (
                <>
                    <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                        <Input
                            type="color"
                            value={attributes.generalBg}
                            onChange={e => updateAttr({ generalBg: e.target.value })}
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
                        <Input
                            value={attributes.generalRadius || `0 0 16px 16px`}
                            onChange={e => updateAttr({ generalRadius: e.target.value })}
                        />
                    </ControlWrapper>
                </>
            ),
        },
        {
            key: 'reset-style',
            label: __('Reset Button', 'website-accessibility'),
            children: (
                <>
                    <ControlWrapper label={__('Background Color', 'website-accessibility')}>
                        <Input
                            type="color"
                            value={attributes.resetBtnBg}
                            onChange={e => updateAttr({ resetBtnBg: e.target.value })}
                        />
                    </ControlWrapper>
                    <ControlWrapper label={__('Text Color', 'website-accessibility')}>
                        <Input
                            type="color"
                            value={attributes.resetBtnColor}
                            onChange={e => updateAttr({ resetBtnColor: e.target.value })}
                        />
                    </ControlWrapper>
                    <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                        <Input
                            value={attributes.resetBtnRadius}
                            onChange={e => updateAttr({ resetBtnRadius: e.target.value })}
                        />
                    </ControlWrapper>
                </>
            ),
        },
        {
            key: 'links-style',
            label: __('Footer Links', 'website-accessibility'),
            children: (
                <>
                    <ControlWrapper label={__('Link Color', 'website-accessibility')}>
                        <Input
                            type="color"
                            value={attributes.linkColor || '#0073ea'}
                            onChange={e => updateAttr({ linkColor: e.target.value })}
                        />
                    </ControlWrapper>
                    <ControlWrapper label={__('Branding Color', 'website-accessibility')}>
                        <Input
                            type="color"
                            value={attributes.brandingColor || '#1a4cd8'}
                            onChange={e => updateAttr({ brandingColor: e.target.value })}
                        />
                    </ControlWrapper>
                </>
            ),
        },
    ];

    const tabItems = [
        {
            key: 'content',
            label: __('Content', 'website-accessibility'),
            children: <Collapse items={contentCollapseItems} defaultActiveKey={['reset']} />,
        },
        {
            key: 'style',
            label: __('Style', 'website-accessibility'),
            children: <Collapse items={styleCollapseItems} defaultActiveKey={['general']} />,
        },
    ];

    return <Tabs defaultActiveKey="content" items={tabItems} />;
};

export default FooterSettings;
