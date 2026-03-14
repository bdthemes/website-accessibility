import {
    EditOutlined,
} from "@ant-design/icons";
import { useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { STORE_NAME } from '../store';
import ControlWrapper from '../components/control-wrapper';
import { __ } from '@wordpress/i18n';
import FeaturesCustomization from './features-customization';


const FeatureSettings = () => {
    const { WapSwitch, WapModal, WapButton, WapFlex, WapTypography } = window?.wapComponents;
    const { Title } = WapTypography;
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

    return (
        <>
            <WapFlex align="center" justify='space-between'>
                <Title level={5} style={{ margin: 0 }}>{__('Feature Customization', 'website-accessibility')}</Title>
                <WapFlex align="center" gap={5}>
                    <WapButton type="primary" size="small" shape='circle' onClick={() => setOpenCustomizationModal(true)} icon={<EditOutlined />}></WapButton>
                    <WapModal
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
                    </WapModal>
                </WapFlex>
            </WapFlex>
            <WapTypography.Title level={5}>{__('Items', 'website-accessibility')}</WapTypography.Title>
            <ControlWrapper
                label={__('Hide Item Icons', 'website-accessibility')}
            >
                <WapSwitch checked={attributes.hideItemIcons} onChange={(checked) => updateAttr({ hideItemIcons: checked })} />
            </ControlWrapper>
            <ControlWrapper
                label={__('Hide Item Labels', 'website-accessibility')}
            >
                <WapSwitch checked={attributes.hideItemLabels} onChange={(checked) => updateAttr({ hideItemLabels: checked })} />
            </ControlWrapper>
        </>
    );
};

export default FeatureSettings;