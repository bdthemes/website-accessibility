import { Collapse, Input, Switch, Flex, Typography, Button, Modal } from 'antd';
import {
    EditOutlined,
} from "@ant-design/icons";
import { useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import FeaturesCustomization from './features-customization';
const { Title } = Typography;

const FeatureSettings = () => {
    const [openCustomizationModal, setOpenCustomizationModal] = useState(false);
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

    const collapseItems = [
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
                    <Flex align="center" justify='space-between'>
                        <Title level={5} style={{ margin: 0 }}>{__('Feature Customization', 'website-accessibility')}</Title>
                        <Flex align="center" gap={5}>
                            <Button type="primary" size="small" shape='circle' onClick={() => setOpenCustomizationModal(true)} icon={<EditOutlined />}></Button>
                            <Modal
                                title={__('Feature Customization', 'website-accessibility')}
                                open={openCustomizationModal}
                                onCancel={() => {
                                    setOpenCustomizationModal(false);
                                }}
                                zIndex={99999999999}
                                footer={null}
                                width={'60vw'}
                            >
                                <FeaturesCustomization updateAttr={updateAttr} attributes={attributes} />
                            </Modal>
                        </Flex>
                    </Flex>
                </>
            )
        },
        {
            key: '2',
            label: __('Header', 'website-accessibility'),
            children: (
                <>
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
                </>
            )
        },
        {
            key: '3',
            label: __('Items', 'website-accessibility'),
            children: (
                <>
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
                </>
            )
        }
    ];

    return (
        <Collapse items={collapseItems} />
    );
};

export default FeatureSettings;