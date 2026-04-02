import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from "@wordpress/data";
import { DEFAULT_STATE, STORE_NAME } from "../store";
import { useHistory } from '../router';
import PresetEditorPreview from '../components/preset-editor-preview';
import PanelCustomizationPreset from '../components/preset-panel-customization';


const CreatePreset = () => {
  const { WapCard, WapButton, WapSpace, WapTypography } = window?.wapComponents;
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData, createPreset } = useDispatch(STORE_NAME);
  const history = useHistory();
  const { Title } = WapTypography;

  useEffect(() => {
    setPresetsFormData({
      ...DEFAULT_STATE?.presetsFormData,
      panel: {
        ...DEFAULT_STATE?.presetsFormData?.panel,
        wrapper: {
          ...DEFAULT_STATE?.presetsFormData?.panel?.wrapper,
        },
        items: [...(DEFAULT_STATE?.presetsFormData?.panel?.items || [])],
      },
      button: {
        ...DEFAULT_STATE?.presetsFormData?.button,
      },
      preset: {
        ...DEFAULT_STATE?.presetsFormData?.preset,
      },
    });
  }, []);

  const handleBack = () => {
    history.push({ page: 'website-accessibility-presets' });
  };

  return (
    <div className="wap-preset-editor">
      <PresetEditorPreview />
      <div className="wap-preset-editor-content">
        <WapCard className='wap-header-card'>
          <Title level={2} className='wap-header-card-title'>
            {__('Create New Preset', 'website-accessibility')}
          </Title>
          <WapButton
            type="primary"
            onClick={handleBack}
            size='large'
          >
            <WapSpace>
              <span className='dashicons dashicons-arrow-left-alt' />
              {__('Back to Presets', 'website-accessibility')}
            </WapSpace>
          </WapButton>
        </WapCard>

        <PanelCustomizationPreset />
      </div>

      <div className="wap-preset-form-actions" style={{ marginTop: 24 }}>
        <WapSpace>
          <WapButton
            type="primary"
            htmlType="submit"
            size='large'
            disabled={!presetsFormData?.title}
            onClick={() => {
              createPreset(presetsFormData);
              history.push({
                page: 'website-accessibility-presets'
              });
              setPresetsFormData(DEFAULT_STATE?.presetsFormData);
            }}
          >
            <WapSpace>
              {__('Save Preset', 'website-accessibility')}
              <span className='dashicons dashicons-arrow-right-alt' />
            </WapSpace>
          </WapButton>
        </WapSpace>
      </div>
    </div>
  );
};

export default CreatePreset;
