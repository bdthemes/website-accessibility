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

    return (
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
    );
};

export default LanguageSelectorSettings;