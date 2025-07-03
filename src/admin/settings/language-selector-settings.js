import { Tabs, Select, Collapse, Radio, Input, Switch } from 'antd';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';

const LanguageSelectorSettings = () => {
    const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
    const { setPresetsFormData } = useDispatch(STORE_NAME);
    const languageItem = presetsFormData.panel.items.find(item => item.slug === 'language');
    const attributes = languageItem?.attributes || {};

    const updateAttr = (updates) => {
        const updatedItems = presetsFormData.panel.items.map((item) =>
            item.slug === 'language'
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
                                label={__('Layout', 'website-accessibility')}
                            >
                                <Radio.Group
                                    value={attributes.layout || 'collapse'}
                                    onChange={(e) => updateAttr({ layout: e.target.value })}
                                >
                                    <Radio value="collapse">{__('With Collapse', 'website-accessibility')}</Radio>
                                    <Radio value="list">{__('Simple List', 'website-accessibility')}</Radio>
                                </Radio.Group>
                            </ControlWrapper>
                        </Collapse.Panel>
                        <Collapse.Panel header={__('Header', 'website-accessibility')} key="2">
                            <ControlWrapper
                                label={__('Hide Flag', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideHeaderFlag} onChange={(checked) => updateAttr({ hideHeaderFlag: checked })} />
                            </ControlWrapper>
                            <ControlWrapper
                                label={__('Hide Language Code badge', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideHeaderLanguageCode} onChange={(checked) => updateAttr({ hideHeaderLanguageCode: checked })} />
                            </ControlWrapper>
                        </Collapse.Panel>
                        <Collapse.Panel header={__('Body', 'website-accessibility')} key="3">
                            <ControlWrapper
                                label={__('Hide Flag', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideBodyFlag} onChange={(checked) => updateAttr({ hideBodyFlag: checked })} />
                            </ControlWrapper>
                            <ControlWrapper
                                label={__('Hide Language Code badge', 'website-accessibility')}
                            >
                                <Switch checked={attributes.hideBodyLanguageCode} onChange={(checked) => updateAttr({ hideBodyLanguageCode: checked })} />
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
                                                label={__('Space between title and badge', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.headerSpaceBetweenTitleAndBadge || ''}
                                                    onChange={(e) => updateAttr({ headerSpaceBetweenTitleAndBadge: e.target.value })}
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
                                    key: 'badge',
                                    label: __('Badge', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Background Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.headerBadgeBackgroundColor || ''}
                                                    onChange={(e) => updateAttr({ headerBadgeBackgroundColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Text Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.headerBadgeTextColor || ''}
                                                    onChange={(e) => updateAttr({ headerBadgeTextColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.headerBadgeSize || ''}
                                                    onChange={(e) => updateAttr({ headerBadgeSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Font Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.headerBadgeFontSize || ''}
                                                    onChange={(e) => updateAttr({ headerBadgeFontSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Font Weight', 'website-accessibility')}
                                            >
                                                <Select
                                                    value={attributes?.headerBadgeFontWeight || 'normal'}
                                                    onChange={(value) => updateAttr({ headerBadgeFontWeight: value })}
                                                    options={[
                                                        { label: __('Normal', 'website-accessibility'), value: 'normal' },
                                                        { label: __('Bold', 'website-accessibility'), value: 'bold' },
                                                        { label: __('Light', 'website-accessibility'), value: '300' },
                                                        { label: __('Medium', 'website-accessibility'), value: '500' }
                                                    ]}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border', 'website-accessibility')}
                                                description={__('Enter border in the format "width style color"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.headerBadgeBorder || ''}
                                                    onChange={(e) => updateAttr({ headerBadgeBorder: e.target.value })}
                                                    placeholder="1px solid #000"
                                                />
                                            </ControlWrapper>

                                            <ControlWrapper
                                                label={__('Border Radius', 'website-accessibility')}
                                                description={__('Enter border radius in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.headerBadgeBorderRadius || ''}
                                                    onChange={(e) => updateAttr({ headerBadgeBorderRadius: e.target.value })}
                                                    placeholder="50%"
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                }
                            ]}
                        />
                    </Collapse.Panel>

                    <Collapse.Panel header={__('Search Bar', 'website-accessibility')} key="3">
                        <ControlWrapper
                            label={__('Background Color', 'website-accessibility')}
                        >
                            <Input
                                type="color"
                                value={attributes?.searchBarBackgroundColor || ''}
                                onChange={(e) => updateAttr({ searchBarBackgroundColor: e.target.value })}
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Text Color', 'website-accessibility')}
                        >
                            <Input
                                type="color"
                                value={attributes?.searchBarTextColor || ''}
                                onChange={(e) => updateAttr({ searchBarTextColor: e.target.value })}
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Padding', 'website-accessibility')}
                            description={__('Enter padding in the format "top right bottom left"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.searchBarPadding || ''}
                                onChange={(e) => updateAttr({ searchBarPadding: e.target.value })}
                                placeholder="8px 16px"
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Margin', 'website-accessibility')}
                            description={__('Enter margin in the format "top right bottom left"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.searchBarMargin || ''}
                                onChange={(e) => updateAttr({ searchBarMargin: e.target.value })}
                                placeholder="8px 16px"
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Border', 'website-accessibility')}
                            description={__('Enter border in the format "width style color"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.searchBarBorder || ''}
                                onChange={(e) => updateAttr({ searchBarBorder: e.target.value })}
                                placeholder="1px solid #000"
                            />
                        </ControlWrapper>

                        <ControlWrapper
                            label={__('Border Radius', 'website-accessibility')}
                            description={__('Enter border radius in the format "top right bottom left"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.searchBarBorderRadius || ''}
                                onChange={(e) => updateAttr({ searchBarBorderRadius: e.target.value })}
                                placeholder="8px"
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Box Shadow', 'website-accessibility')}
                            description={__('Enter box shadow in the format "x y blur spread color"', 'website-accessibility')}
                        >
                            <Input
                                value={attributes?.searchBarBoxShadow || ''}
                                onChange={(e) => updateAttr({ searchBarBoxShadow: e.target.value })}
                                placeholder="0 0 10px 0 rgba(0, 0, 0, 0.1)"
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Font Size', 'website-accessibility')}
                        >
                            <Input
                                type="number"
                                placeholder="16"
                                value={attributes?.searchBarFontSize || ''}
                                onChange={(e) => updateAttr({ searchBarFontSize: e.target.value })}
                                addonAfter="px"
                            />
                        </ControlWrapper>
                        <ControlWrapper
                            label={__('Font Weight', 'website-accessibility')}
                        >
                            <Select
                                value={attributes?.searchBarFontWeight || 'normal'}
                                onChange={(value) => updateAttr({ searchBarFontWeight: value })}
                                options={[
                                    { label: __('Normal', 'website-accessibility'), value: 'normal' },
                                    { label: __('Bold', 'website-accessibility'), value: 'bold' },
                                    { label: __('Light', 'website-accessibility'), value: '300' },
                                    { label: __('Medium', 'website-accessibility'), value: '500' }
                                ]}
                            />
                        </ControlWrapper>
                    </Collapse.Panel>
                    <Collapse.Panel header={__('Body', 'website-accessibility')} key="4">
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
                                                    value={attributes?.bodyPadding || ''}
                                                    onChange={(e) => updateAttr({ bodyPadding: e.target.value })}
                                                    placeholder="8px 16px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Margin', 'website-accessibility')}
                                                description={__('Enter margin in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.bodyMargin || ''}
                                                    onChange={(e) => updateAttr({ bodyMargin: e.target.value })}
                                                    placeholder="8px 16px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border', 'website-accessibility')}
                                                description={__('Enter border in the format "width style color"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.bodyBorder || ''}
                                                    onChange={(e) => updateAttr({ bodyBorder: e.target.value })}
                                                    placeholder="1px solid #000"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border Radius', 'website-accessibility')}
                                                description={__('Enter border radius in the format "top right bottom left"', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.bodyBorderRadius || ''}
                                                    onChange={(e) => updateAttr({ bodyBorderRadius: e.target.value })}
                                                    placeholder="8px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Space between item and badge', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.bodySpaceBetweenItemAndBadge || ''}
                                                    onChange={(e) => updateAttr({ bodySpaceBetweenItemAndBadge: e.target.value })}
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
                                                    placeholder="16"
                                                    value={attributes?.bodyFontSize || ''}
                                                    onChange={(e) => updateAttr({ bodyFontSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Font Weight', 'website-accessibility')}
                                            >
                                                <Select
                                                    value={attributes?.bodyFontWeight || 'normal'}
                                                    onChange={(value) => updateAttr({ bodyFontWeight: value })}
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
                                                    value={attributes?.bodyTextColor || '#000000'}
                                                    onChange={(e) => updateAttr({ bodyTextColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                        </>
                                    )
                                },
                                {
                                    key: 'item-badge',
                                    label: __('Item Badge', 'website-accessibility'),
                                    children: (
                                        <>
                                            <ControlWrapper
                                                label={__('Background Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.bodyBadgeBackgroundColor || '#000000'}
                                                    onChange={(e) => updateAttr({ bodyBadgeBackgroundColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Text Color', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="color"
                                                    value={attributes?.bodyBadgeTextColor || '#000000'}
                                                    onChange={(e) => updateAttr({ bodyBadgeTextColor: e.target.value })}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Font Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.bodyBadgeFontSize || ''}
                                                    onChange={(e) => updateAttr({ bodyBadgeFontSize: e.target.value })}
                                                    addonAfter="px"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Font Weight', 'website-accessibility')}
                                            >
                                                <Select
                                                    value={attributes?.bodyBadgeFontWeight || 'normal'}
                                                    onChange={(value) => updateAttr({ bodyBadgeFontWeight: value })}
                                                    options={[
                                                        { label: __('Normal', 'website-accessibility'), value: 'normal' },
                                                        { label: __('Bold', 'website-accessibility'), value: 'bold' },
                                                        { label: __('Light', 'website-accessibility'), value: '300' },
                                                        { label: __('Medium', 'website-accessibility'), value: '500' }
                                                    ]}
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.bodyBadgeBorder || ''}
                                                    onChange={(e) => updateAttr({ bodyBadgeBorder: e.target.value })}
                                                    placeholder="1px solid #000"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Border Radius', 'website-accessibility')}
                                            >
                                                <Input
                                                    value={attributes?.bodyBadgeBorderRadius || ''}
                                                    onChange={(e) => updateAttr({ bodyBadgeBorderRadius: e.target.value })}
                                                    placeholder="50%"
                                                />
                                            </ControlWrapper>
                                            <ControlWrapper
                                                label={__('Size', 'website-accessibility')}
                                            >
                                                <Input
                                                    type="number"
                                                    placeholder="16"
                                                    value={attributes?.bodyBadgeSize || ''}
                                                    onChange={(e) => updateAttr({ bodyBadgeSize: e.target.value })}
                                                    addonAfter="px"
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

export default LanguageSelectorSettings;