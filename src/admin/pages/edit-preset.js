import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { steps } from '../../utils';
import { useDispatch, useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useHistory, useLocation } from '../router';


const EditPreset = () => {
  const { WapCard, WapButton, WapSpace, WapTypography, WapSteps } = window?.wapComponents;
  const [current, setCurrent] = useState(0);
  const { updatePreset, saveEditedPreset, setPresetsFormData } = useDispatch(STORE_NAME);
  const history = useHistory();
  const location = useLocation();
  const id = location?.params?.id;
  const page = location?.params?.page;
  const { Title } = WapTypography;

  const handleBack = () => {
    history.push({ page: 'website-accessibility-presets' });
  };

  const next = async () => {
    setCurrent((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prev = () => {
    setCurrent((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      const presetData = {
        title: preset?.title,
        ...content,
      };
      setPresetsFormData(presetData);
    } else {
      history.push({
        page: 'website-accessibility-presets',
      });
    }
  }, [preset]);

  if (!preset) return null;

  const StepContent = steps[current].content;

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

      <WapSteps
        current={current}
        size="small"
        className="wap-preset-steps"
        style={{ padding: '24px 0', marginBottom: 24 }}
        items={steps.map((step) => ({ title: step.title }))}
        onChange={(value) => {
          if (current === 0 && !presetsFormData?.title) return;
          setCurrent(value);
        }}
      />

      <StepContent />

      {/* <Card className="wap-preset-form-actions-card" style={{ marginTop: 24 }}> */}
      <div className="wap-preset-form-actions" style={{ marginTop: 24 }}>
        <WapSpace>
          {current > 0 && (
            <WapButton onClick={prev} htmlType='button' size='large'>
              <WapSpace>
                <span className='dashicons dashicons-arrow-left-alt' />
                {__('Previous', 'website-accessibility')}
              </WapSpace>
            </WapButton>
          )}
          {current < steps.length - 1 && (
            <WapButton
              size='large'
              type="primary"
              onClick={next}
              htmlType='button'
              disabled={current === 0 && !presetsFormData?.title}
            >
              <WapSpace>
                {__('Next', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </WapSpace>
            </WapButton>
          )}
          {current === steps.length - 1 && (
            <WapButton
              type="primary"
              onClick={handleSave}
              size='large'
            >
              <WapSpace>
                {__('Update Preset', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </WapSpace>
            </WapButton>
          )}
        </WapSpace>
      </div>
      {/* </Card> */}
    </div>
  );
};

export default EditPreset;
