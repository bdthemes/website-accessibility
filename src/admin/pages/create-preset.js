import { useState } from '@wordpress/element';
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
import { DEFAULT_STATE, STORE_NAME } from "../store";
import { useHistory } from '../router';

const CreatePreset = () => {
  const [current, setCurrent] = useState(0);
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData, createPreset } = useDispatch(STORE_NAME);
  const history = useHistory();
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

  const StepContent = steps[current].content;

  return (
    <div className="wap-preset-editor">
      <Card className='wap-header-card'>
        <Title level={2} className='wap-header-card-title'>
          {__('Create New Preset', 'website-accessibility')}
        </Title>
        <Button
          type="primary"
          onClick={handleBack}
          size='large'
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
        onChange={(value) => {
          if(current === 0 && !presetsFormData?.title) return;
          setCurrent(value);
        }}
      />

      <StepContent />

      <div className="wap-preset-form-actions" style={{ marginTop: 24 }}>
        <Space>
          {current > 0 && (
            <Button onClick={prev} size='large' htmlType='button'>
              <Space>
                <span className='dashicons dashicons-arrow-left-alt' />
                {__('Previous', 'website-accessibility')}
              </Space>
            </Button>
          )}
          {current < steps.length - 1 && (
            <Button type="primary" onClick={next} size='large' htmlType='button' disabled={current === 0 && !presetsFormData?.title}>
              <Space>
                {__('Next', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </Space>
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              type="primary"
              htmlType="submit"
              size='large'
              onClick={() => {
                createPreset(presetsFormData);
                history.push({
                  page: 'website-accessibility-presets'
                });
                setPresetsFormData(DEFAULT_STATE?.presetsFormData);
              }}
            >
              <Space>
                {__('Save Preset', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </Space>
            </Button>
          )}
        </Space>
      </div>
      {/* </Card> */}
    </div>
  );
};

export default CreatePreset;
