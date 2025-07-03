import { useMemo } from '@wordpress/element';
import { Tabs, Select, Collapse, Space, Radio, Input, Switch } from 'antd';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';

const FeatureSettings = () => {
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

    const tabItems = [
        {
            key: 'content',
            label: __('Content', 'website-accessibility'),
            children: (
                <>
                    <Collapse>
                        <Collapse.Panel header={__('General', 'website-accessibility')} key="1">
                            <ControlWrapper
                                label={__('Hide Oversized Widget', 'website-accessibility')}
                            >
                                <Switch
                                    checked={attributes?.hideOversizedWidget || false}
                                    onChange={(checked) => updateAttr({ hideOversizedWidget: checked })}
                                />
                            </ControlWrapper>
                            
                            {
                                !attributes?.hideOversizedWidget && (
                                    <ControlWrapper
                                        label={__('Oversized Widget Title', 'website-accessibility')}
                                    >
                                        <Input
                                            placeholder={__('Oversized Widget Title', 'website-accessibility')}
                                            value={attributes?.oversizedTitle || ''}
                                            onChange={(e) => updateAttr({ oversizedTitle: e.target.value })}
                                            style={{ width: '100%' }}
                                        />
                                    </ControlWrapper>
                                )
                            }
                            
                            <ControlWrapper
                                label={__('Items per Row', 'website-accessibility')}
                            >
                                <Input
                                    type="number"
                                    placeholder="3"
                                    value={attributes?.itemsPerRow || '3'}
                                    onChange={(e) => updateAttr({ itemsPerRow: e.target.value })}
                                    style={{ width: '100%' }}
                                    min={1}
                                    max={6}
                                />
                            </ControlWrapper>
                        </Collapse.Panel>
                        
                        <Collapse.Panel header={__('Header', 'website-accessibility')} key="2">
                            <ControlWrapper
                                label={__('Hide Title', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideHeaderTitle} onChange={(checked) => updateAttr({ hideHeaderTitle: checked })} />
                            </ControlWrapper>
                            <ControlWrapper
                                label={__('Hide Icon', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideHeaderIcon} onChange={(checked) => updateAttr({ hideHeaderIcon: checked })} />
                            </ControlWrapper>
                        </Collapse.Panel>
                        
                        <Collapse.Panel header={__('Items', 'website-accessibility')} key="3">
                            <ControlWrapper
                                label={__('Hide Item Icons', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideItemIcons} onChange={(checked) => updateAttr({ hideItemIcons: checked })} />
                            </ControlWrapper>
                            <ControlWrapper
                                label={__('Hide Item Labels', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideItemLabels} onChange={(checked) => updateAttr({ hideItemLabels: checked })} />
                            </ControlWrapper>
                        </Collapse.Panel>
                    </Collapse>
                </>
            )
        },
        {
            key: 'style',
            label: __('Style', 'website-accessibility'),
            children: (
                <Collapse>
                    <Collapse.Panel header={__('General Styling', 'website-accessibility')} key="1">
                        <ControlWrapper
                            label={__('Background Color', 'website-accessibility')}
                        >
                            <Input
                                type="color"
                                value={attributes?.backgroundColor || '#ffffff'}
                                onChange={(e) => updateAttr({ backgroundColor: e.target.value })}
                            />
                        </ControlWrapper>

                        <ControlWrapper
                            label={__('Padding', 'website-accessibility')}
                            description={__('Enter padding in the format "top right bottom left"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.padding || ''}
                                onChange={(e) => updateAttr({ padding: e.target.value })}
                                placeholder="8px 16px"
                            />
                        </ControlWrapper>
                        
                        <ControlWrapper
                            label={__('Margin', 'website-accessibility')}
                            description={__('Enter margin in the format "top right bottom left"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.margin || ''}
                                onChange={(e) => updateAttr({ margin: e.target.value })}
                                placeholder="8px 16px"
                            />
                        </ControlWrapper>
                        
                        <ControlWrapper
                            label={__('Border', 'website-accessibility')}
                            description={__('Enter border in the format "width style color"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.border || ''}
                                onChange={(e) => updateAttr({ border: e.target.value })}
                                placeholder="1px solid #000"
                            />
                        </ControlWrapper>

                        <ControlWrapper
                            label={__('Border Radius', 'website-accessibility')}
                            description={__('Enter border radius in the format "top right bottom left"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.borderRadius || ''}
                                onChange={(e) => updateAttr({ borderRadius: e.target.value })}
                                placeholder="8px"
                            />
                        </ControlWrapper>
                    </Collapse.Panel>

                    <Collapse.Panel header={__('Header', 'website-accessibility')} key="2">
                        <Tabs
                            items={[
                                {
                                    key: 'wrapper',
                                    label: __('Wrapper', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Padding', 'website-accessibility')}
                                                description={__('Enter padding in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.headerPadding || ''}
                                                    onChange={(e) => updateAttr({ headerPadding: e.target.value })}
                                                    placeholder="8px 16px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Margin', 'website-accessibility')}
                                                description={__('Enter margin in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.headerMargin || ''}
                                                    onChange={(e) => updateAttr({ headerMargin: e.target.value })}
                                                    placeholder="8px 16px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border', 'website-accessibility')}
                                                description={__('Enter border in the format "width style color"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.headerBorder || ''}
                                                    onChange={(e) => updateAttr({ headerBorder: e.target.value })}
                                                    placeholder="1px solid #000"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border Radius', 'website-accessibility')}
                                                description={__('Enter border radius in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.headerBorderRadius || ''}
                                                    onChange={(e) => updateAttr({ headerBorderRadius: e.target.value })}
                                                    placeholder="8px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Space between icon and title', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="12"
                                                    value={attributes?.headerSpaceBetweenIconAndTitle || ''}
                                                    onChange={(e) => updateAttr({ headerSpaceBetweenIconAndTitle: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                },
                                {
                                    key: 'title',
                                    label: __('Title', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Font Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.headerTitleFontSize || ''}
                                                    onChange={(e) => updateAttr({ headerTitleFontSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Font Weight', 'website-accessibility')}
                                            >
                                                <Select
                                                    value={attributes?.headerTitleFontWeight || 'normal'}
                                                    onChange={(value) => updateAttr({ headerTitleFontWeight: value })}
                                                    options={[
                                                        { label: __('Normal', 'website-accessibility'), value: 'normal' },
                                                        { label: __('Bold', 'website-accessibility'), value: 'bold' },
                                                        { label: __('Light', 'website-accessibility'), value: '300' },
                                                        { label: __('Medium', 'website-accessibility'), value: '500' }
                                                    ]}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Text Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.headerTitleTextColor || ''}
                                                    onChange={(e) => updateAttr({ headerTitleTextColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                },
                                {
                                    key: 'icon',
                                    label: __('Icon', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="20"
                                                    value={attributes?.headerIconSize || ''}
                                                    onChange={(e) => updateAttr({ headerIconSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.headerIconColor || ''}
                                                    onChange={(e) => updateAttr({ headerIconColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                }
                            ]}
                        />
                    </Collapse.Panel>
                    
                    <Collapse.Panel header={__('Items', 'website-accessibility')} key="3">
                        <Tabs
                            items={[
                                {
                                    key: 'wrapper',
                                    label: __('Wrapper', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Padding', 'website-accessibility')}
                                                description={__('Enter padding in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.itemsPadding || ''}
                                                    onChange={(e) => updateAttr({ itemsPadding: e.target.value })}
                                                    placeholder="8px 16px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Margin', 'website-accessibility')}
                                                description={__('Enter margin in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.itemsMargin || ''}
                                                    onChange={(e) => updateAttr({ itemsMargin: e.target.value })}
                                                    placeholder="8px 16px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border', 'website-accessibility')}
                                                description={__('Enter border in the format "width style color"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.itemsBorder || ''}
                                                    onChange={(e) => updateAttr({ itemsBorder: e.target.value })}
                                                    placeholder="1px solid #000"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border Radius', 'website-accessibility')}
                                                description={__('Enter border radius in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.itemsBorderRadius || ''}
                                                    onChange={(e) => updateAttr({ itemsBorderRadius: e.target.value })}
                                                    placeholder="8px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Space between icon and label', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="12"
                                                    value={attributes?.itemsSpaceBetweenIconAndLabel || ''}
                                                    onChange={(e) => updateAttr({ itemsSpaceBetweenIconAndLabel: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                },
                                {
                                    key: 'item',
                                    label: __('Item Text', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Font Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="14"
                                                    value={attributes?.itemsFontSize || ''}
                                                    onChange={(e) => updateAttr({ itemsFontSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Font Weight', 'website-accessibility')}
                                            >
                                                <Select
                                                    value={attributes?.itemsFontWeight || 'normal'}
                                                    onChange={(value) => updateAttr({ itemsFontWeight: value })}
                                                    options={[
                                                        { label: __('Normal', 'website-accessibility'), value: 'normal' },
                                                        { label: __('Bold', 'website-accessibility'), value: 'bold' },
                                                        { label: __('Light', 'website-accessibility'), value: '300' },
                                                        { label: __('Medium', 'website-accessibility'), value: '500' }
                                                    ]}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Text Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.itemsTextColor || '#000000'}
                                                    onChange={(e) => updateAttr({ itemsTextColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                },
                                {
                                    key: 'item-icon',
                                    label: __('Item Icons', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.itemsIconSize || ''}
                                                    onChange={(e) => updateAttr({ itemsIconSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.itemsIconColor || ''}
                                                    onChange={(e) => updateAttr({ itemsIconColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                }
                            ]}
                        />
                    </Collapse.Panel>
                </Collapse>
            )
        }
    ];

    return (
        <Tabs defaultActiveKey="content" items={tabItems} />
    );
};

export default FeatureSettings;