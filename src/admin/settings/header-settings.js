import { Tabs, Input, Switch, Select, Collapse } from 'antd';
import { __ } from '@wordpress/i18n';
import ControlWrapper from '../components/control-wrapper';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';

const { Panel } = Collapse;

const ContentTab = ({ presetsFormData, setPresetsFormData }) => {
    const { items } = presetsFormData?.panel || {};
    const headerItem = items?.find(item => item.slug === 'header');
    const attributes = headerItem?.attributes || {};

    const updateAttr = (updates) => {
        const updatedItems = items.map((item) =>
            item.slug === 'header' 
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
            <ControlWrapper label={__('Header Text', 'website-accessibility')}>
                <Input 
                    value={attributes.text || ''}
                    onChange={e => updateAttr({ text: e.target.value })}
                    placeholder={__('Accessibility Menu (CTRL+U)', 'website-accessibility')} 
                />
            </ControlWrapper>

            <ControlWrapper label={__('Show Close Button', 'website-accessibility')}>
                <Switch 
                    checked={attributes.showClose !== false}
                    onChange={checked => updateAttr({ showClose: checked })}
                />
            </ControlWrapper>
        </>
    );
};

const StyleTab = ({ presetsFormData, setPresetsFormData }) => {
    const { items } = presetsFormData?.panel || {};
    const headerItem = items?.find(item => item.slug === 'header');
    const attributes = headerItem?.attributes || {};

    const updateAttr = (updates) => {
        const updatedItems = items.map((item) =>
            item.slug === 'header' 
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
        <Collapse accordion>
            <Panel header={__('Header', 'website-accessibility')} key="1">
                <ControlWrapper label={__('Background', 'website-accessibility')}>
                    <Input 
                        type="color" 
                        className="wap-panel-right-sidebar__color-input"
                        value={attributes.background}
                        onChange={e => updateAttr({ background: e.target.value })}
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Border', 'website-accessibility')}>
                    <Input 
                        value={attributes.border}
                        onChange={e => updateAttr({ border: e.target.value })}
                        placeholder="1px solid #2e6cf6" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                    <Input 
                        value={attributes.borderRadius}
                        onChange={e => updateAttr({ borderRadius: e.target.value })}
                        placeholder="6px" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Box Shadow', 'website-accessibility')}>
                    <Input 
                        value={attributes.boxShadow}
                        onChange={e => updateAttr({ boxShadow: e.target.value })}
                        placeholder="0 4px 24px rgba(0,0,0,0.08)" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Padding', 'website-accessibility')}>
                    <Input 
                        value={attributes.padding}
                        onChange={e => updateAttr({ padding: e.target.value })}
                        placeholder="10px 20px" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Text Color', 'website-accessibility')}>
                    <Input 
                        type="color" 
                        className="wap-panel-right-sidebar__color-input"
                        value={attributes.color}
                        onChange={e => updateAttr({ color: e.target.value })}
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Font Size', 'website-accessibility')}>
                    <Input 
                        value={attributes.fontSize}
                        onChange={e => updateAttr({ fontSize: e.target.value })}
                        placeholder="14px" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Font Weight', 'website-accessibility')}>
                    <Select
                        value={attributes.fontWeight}
                        onChange={value => updateAttr({ fontWeight: value })}
                        options={[
                            { value: '400', label: 'Normal (400)' },
                            { value: '500', label: 'Medium (500)' },
                            { value: '600', label: 'Semi Bold (600)' },
                            { value: '700', label: 'Bold (700)' },
                            { value: '800', label: 'Extra Bold (800)' },
                            { value: '900', label: 'Black (900)' },
                        ]}
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Text Decoration', 'website-accessibility')}>
                    <Select
                        value={attributes.textDecoration}
                        onChange={value => updateAttr({ textDecoration: value })}
                        options={[
                            { value: 'none', label: 'None' },
                            { value: 'underline', label: 'Underline' },
                            { value: 'line-through', label: 'Line Through' },
                            { value: 'overline', label: 'Overline' },
                        ]}
                    />
                </ControlWrapper>
            </Panel>
            <Panel header={__('Close Button', 'website-accessibility')} key="2">
                <ControlWrapper label={__('Background', 'website-accessibility')}>
                    <Input 
                        type="color" 
                        className="wap-panel-right-sidebar__color-input"
                        value={attributes.closeButtonBackground}
                        onChange={e => updateAttr({ closeButtonBackground: e.target.value })}
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Color', 'website-accessibility')}>
                    <Input 
                        type="color" 
                        className="wap-panel-right-sidebar__color-input"
                        value={attributes.closeButtonColor}
                        onChange={e => updateAttr({ closeButtonColor: e.target.value })}
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Size', 'website-accessibility')}>
                    <Input 
                        value={attributes.closeButtonSize}
                        onChange={e => updateAttr({ closeButtonSize: e.target.value })}
                        placeholder="24px" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Border', 'website-accessibility')}>
                    <Input 
                        value={attributes.closeButtonBorder}
                        onChange={e => updateAttr({ closeButtonBorder: e.target.value })}
                        placeholder="1px solid #ff0000" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Border Radius', 'website-accessibility')}>
                    <Input 
                        value={attributes.closeButtonBorderRadius}
                        onChange={e => updateAttr({ closeButtonBorderRadius: e.target.value })}
                        placeholder="50%" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Top', 'website-accessibility')}>
                    <Input 
                        value={attributes.closeButtonTop}
                        onChange={e => updateAttr({ closeButtonTop: e.target.value })}
                        placeholder="10px" 
                    />
                </ControlWrapper>

                <ControlWrapper label={__('Right', 'website-accessibility')}>
                    <Input 
                        value={attributes.closeButtonRight}
                        onChange={e => updateAttr({ closeButtonRight: e.target.value })}
                        placeholder="10px" 
                    />
                </ControlWrapper>
            </Panel>
        </Collapse>
    );
};

const HeaderSettings = () => {
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);

    const tabItems = [
        {
            key: 'content',
            label: __('Content', 'website-accessibility'),
            children: <ContentTab presetsFormData={presetsFormData} setPresetsFormData={setPresetsFormData} />
        },
        {
            key: 'style',
            label: __('Style', 'website-accessibility'),
            children: <StyleTab presetsFormData={presetsFormData} setPresetsFormData={setPresetsFormData} />
        }
    ];

    return (
        <div className="wap-header-settings">
            <Tabs
                items={tabItems}
                defaultActiveKey="content"
                className="wap-header-settings__tabs"
            />
        </div>
    );
};

export default HeaderSettings;