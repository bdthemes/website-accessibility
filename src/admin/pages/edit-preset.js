import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useHistory, useLocation } from '../router';
import PresetEditorPreview from '../components/preset-editor-preview';
import PanelCustomizationPreset from '../components/preset-panel-customization';


const EditPreset = () => {
  const { WapCard, WapButton, WapSpace, WapTypography } = window?.wapComponents;
  const { updatePreset, saveEditedPreset, setPresetsFormData } = useDispatch(STORE_NAME);
  const history = useHistory();
  const location = useLocation();
  const id = location?.params?.id;
  const page = location?.params?.page;
  const { Title } = WapTypography;

  const handleBack = () => {
    history.push({ page: 'website-accessibility-presets' });
  };

  useEffect(() => {
    if (!id || !page) {
      history.push({
        page: 'website-accessibility-presets',
      });
    }
  }, [location]);

  const preset = useSelect((select) => select(STORE_NAME).getPreset(id), [id]);
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());

  // Load preset data into global state when preset is available
  useEffect(() => {
    if (preset && Object.keys(preset).length > 0) {
      const content = JSON.parse(preset?.content);
      delete content.title;
      const presetData = {
        title: preset?.title,
        ...content
      };
      
      setPresetsFormData(presetData);
    } else {
      history.push({
        page: 'website-accessibility-presets',
      });
    }
  }, [preset]);

  if (!preset) return null;

  const handleSave = async () => {
    await updatePreset(id, {
      title: presetsFormData.title,
      content: JSON.stringify(presetsFormData),
    });
    await saveEditedPreset(id);
    history.push({
      page: 'website-accessibility-presets',
    });
  };

  return (
    <div className="wap-preset-editor">
      <PresetEditorPreview />
      <div className="wap-preset-editor-content">
        <WapCard className='wap-header-card'>

          <Title level={2} className='wap-header-card-title'>
            {__('Edit Preset', 'website-accessibility')}
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

      {/* <Card className="wap-preset-form-actions-card" style={{ marginTop: 24 }}> */}
      <div className="wap-preset-form-actions" style={{ marginTop: 24 }}>
        <WapSpace>
          <WapButton
            type="primary"
            onClick={handleSave}
            size='large'
            disabled={!presetsFormData?.title}
          >
            <WapSpace>
              {__('Update Preset', 'website-accessibility')}
              <span className='dashicons dashicons-arrow-right-alt' />
            </WapSpace>
          </WapButton>
        </WapSpace>
      </div>
      {/* </Card> */}
    </div>
  );
};

export default EditPreset;
