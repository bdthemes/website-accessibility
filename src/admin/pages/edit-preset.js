import { useState, useEffect, useMemo } from '@wordpress/element';
import {
  Card,
  Button,
  Steps,
  Space,
  Typography,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { __ } from '@wordpress/i18n';
import { steps } from '../utils';
import { useDispatch, useSelect } from "@wordpress/data";
import { STORE_NAME } from "../store";
import { useHistory, useLocation } from '../router';

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
    }else{
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
      <Card className='wap-header-card'>

          <Title level={2} className='wap-header-card-title'>
            {__('Edit Preset', 'website-accessibility')}
          </Title>
          <Button
            type="primary"
            onClick={handleBack}
          >
            <Space>
              <span className='dashicons dashicons-arrow-left-alt' />
              {__('Back to Presets', 'website-accessibility')}
            </Space>
          </Button>

      </Card>

      <Steps
          current={current}
          size="small"
          className="wap-preset-steps"
          style={{ padding: '24px 0', marginBottom: 24 }}
          items={steps.map((step) => ({ title: step.title }))}
        />

        <StepContent />

      <Card className="wap-preset-form-actions-card" style={{ marginTop: 24 }}>
        <div className="wap-preset-form-actions">
          <Space>
            {current > 0 && (
              <Button onClick={prev} htmlType='button'>
                <Space>
                  <span className='dashicons dashicons-arrow-left-alt' />
                  {__('Previous', 'website-accessibility')}
                </Space>
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={next} 
                htmlType='button' 
                disabled={current === 0 && !presetsFormData?.title}
              >
                <Space>
                  {__('Next', 'website-accessibility')}
                  <span className='dashicons dashicons-arrow-right-alt' />
                </Space>
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={handleSave}
              >
                <Space>
                  {__('Update Preset', 'website-accessibility')}
                  <span className='dashicons dashicons-arrow-right-alt' />
                </Space>
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default EditPreset;
