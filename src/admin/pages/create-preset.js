import { useState } from '@wordpress/element';
import {
  Card,
  Button,
  Steps,
  Space
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { __ } from '@wordpress/i18n';
import { steps } from '../utils';
import { useDispatch, useSelect } from "@wordpress/data";
import { DEFAULT_STATE, STORE_NAME } from "../store";
import { useHistory } from '../router';

const CreatePreset = () => {
  const [current, setCurrent] = useState(0);
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData, createPreset } = useDispatch(STORE_NAME);
  const history = useHistory();

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

  const StepContent = steps[current].content;

  return (
    <div className="wap-preset-editor">
      <Card>
        <div style={{ marginBottom: 24 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginBottom: 16 }}
          >
            {__('Back to Presets', 'website-accessibility')}
          </Button>
        </div>
        <Steps
          current={current}
          size="small"
          className="wap-preset-steps"
          items={steps.map((step) => ({ title: step.title }))}
        />
      </Card>

      <Card className="wap-preset-form-card">
        <StepContent />
      </Card>
      <Card className="wap-preset-form-actions-card">
        <div className="wap-preset-form-actions">
          <Space>
            {current > 0 && (
              <Button onClick={prev} htmlType='button'>
                {__('Previous', 'website-accessibility')}
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={next} htmlType='button' disabled={current === 0 && !presetsFormData?.title}>
                {__('Next', 'website-accessibility')}
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button 
                type="primary" 
                htmlType="submit"
                onClick={() => {
                  createPreset(presetsFormData);
                  history.push({
                    page: 'website-accessibility-presets'
                  });
                  setPresetsFormData(DEFAULT_STATE?.presetsFormData);
                }}
              >
                {__('Save Preset', 'website-accessibility')}
              </Button>
            )}
          </Space>
        </div>
      </Card>
    </div>
  );
};

export default CreatePreset;
