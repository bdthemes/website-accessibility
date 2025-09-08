import { Collapse, Input, Switch } from 'antd';
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

    const items = [
        {
            key: '1',
            label: __('General', 'website-accessibility'),
            children: (
                <>
                    <ControlWrapper
                        label={__('Hide Oversized Widget', 'website-accessibility')}
                    >
                        <Switch
                            checked={attributes?.hideOversizedWidget || false}
                            onChange={(checked) => updateAttr({ hideOversizedWidget: checked })}
                        />
                    </ControlWrapper>

                    {!attributes?.hideOversizedWidget && (
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
                    )}

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
                </>
            ),
        },
        {
            key: '2',
            label: __('Header', 'website-accessibility'),
            children: (
                <>
                    <ControlWrapper
                        label={__('Hide Title', 'website-accessibility')}
                    >
                        <Switch
                            checked={attributes.hideHeaderTitle}
                            onChange={(checked) => updateAttr({ hideHeaderTitle: checked })}
                        />
                    </ControlWrapper>
                    <ControlWrapper
                        label={__('Hide Icon', 'website-accessibility')}
                    >
                        <Switch
                            checked={attributes.hideHeaderIcon}
                            onChange={(checked) => updateAttr({ hideHeaderIcon: checked })}
                        />
                    </ControlWrapper>
                </>
            ),
        },
        {
            key: '3',
            label: __('Items', 'website-accessibility'),
            children: (
                <>
                    <ControlWrapper
                        label={__('Hide Item Icons', 'website-accessibility')}
                    >
                        <Switch
                            checked={attributes.hideItemIcons}
                            onChange={(checked) => updateAttr({ hideItemIcons: checked })}
                        />
                    </ControlWrapper>
                    <ControlWrapper
                        label={__('Hide Item Labels', 'website-accessibility')}
                    >
                        <Switch
                            checked={attributes.hideItemLabels}
                            onChange={(checked) => updateAttr({ hideItemLabels: checked })}
                        />
                    </ControlWrapper>
                </>
            ),
        },
    ];

    return <Collapse items={items} defaultActiveKey={['1']} />;
};

export default FeatureSettings;
