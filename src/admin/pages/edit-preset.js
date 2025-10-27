import { useState, useEffect } from '@wordpress/element';
import {
  Card,
  Button,
  Steps,
  Space,
  Typography,
} from 'antd';
import { __ } from '@wordpress/i18n';
import { steps } from '../../utils';
import { useDispatch, useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useHistory, useLocation } from '../router';
import WapCard from '../../components/wap-card';
import WapButton from '../../components/wap-button';

const EditPreset = () => {
  const [current, setCurrent] = useState(0);
  const { updatePreset, saveEditedPreset, setPresetsFormData } = useDispatch(STORE_NAME);
  const history = useHistory();
  const location = useLocation();
  const id = location?.params?.id;
  const page = location?.params?.page;
  const { Title } = Typography;

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
          <Space>
            <span className='dashicons dashicons-arrow-left-alt' />
            {__('Back to Presets', 'website-accessibility')}
          </Space>
        </WapButton>

      </WapCard>

      <Steps
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
        <Space>
          {current > 0 && (
            <WapButton onClick={prev} htmlType='button' size='large'>
              <Space>
                <span className='dashicons dashicons-arrow-left-alt' />
                {__('Previous', 'website-accessibility')}
              </Space>
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
              <Space>
                {__('Next', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </Space>
            </WapButton>
          )}
          {current === steps.length - 1 && (
            <WapButton
              type="primary"
              onClick={handleSave}
              size='large'
            >
              <Space>
                {__('Update Preset', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </Space>
            </WapButton>
          )}
        </Space>
      </div>
      {/* </Card> */}
    </div>
  );
};

export default EditPreset;
