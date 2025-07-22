import { Drawer, Input, Switch, Button, Space, message, Select } from 'antd';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { DEFAULT_STATE, STORE_NAME } from '../store';
import ControlWrapper from './control-wrapper';
import { locationOptions } from '../../utils';

const PresetQuickEdit = ({
  visible,
  onClose,
  preset: presetRaw,
  onUpdate,
}) => {
  const { updatePreset, saveEditedPreset, setPresetsFormData } = useDispatch(STORE_NAME);
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  
  const preset = useSelect((select) => select(STORE_NAME).getPreset(presetRaw?.id), [presetRaw?.id]);

  // Clear state when drawer closes
  const clearState = () => {
    setPresetsFormData(DEFAULT_STATE?.presetsFormData);
  };

  // Load preset data into global state when preset is available
  useEffect(() => {
    if (preset && visible) {
      const presetData = JSON.parse(preset?.content);
      const initialData = {
        ...presetData,
        title: preset?.title
      };
      
      setPresetsFormData(initialData);
    }
  }, [preset, visible, setPresetsFormData]);
  

  // Clear state when drawer closes
  useEffect(() => {
    if (!visible) {
      clearState();
    }
  }, [visible]);

  const handleSave = async () => {
    try {
      const content = JSON.parse(preset?.content);
      const newContent = {
        ...content,
        preset: {
          ...presetsFormData?.preset,
        },
      };

      await updatePreset(preset.id, {
        title: presetsFormData.title,
        content: JSON.stringify(newContent)
      });

      await saveEditedPreset(preset.id);
      
      message.success(__('Preset updated successfully', 'website-accessibility'));
      
      // Clear state after successful update
      clearState();
      onClose();
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      message.error(__('Failed to update preset', 'website-accessibility'));
    }
  };

  const handleTitleChange = (value) => {
    setPresetsFormData({
      ...presetsFormData,
      title: value
    });
  };

  const handleConditionChange = (value) => {
    setPresetsFormData({
      ...presetsFormData,
      preset: {
        ...presetsFormData.preset,
        condition: value
      }
    });
  };

  const handleActiveChange = (checked) => {
    setPresetsFormData({
      ...presetsFormData,
      preset: {
        ...presetsFormData.preset,
        active: checked
      }
    });
  };

  if (!preset) {
    return null;
  }

  const handleClose = () => {
    clearState();
    onClose();
  };
  
  return (
    <Drawer
      title={__('Quick Edit Preset', 'website-accessibility')}
      className="wap-preset-quick-edit"
      placement="right"
      onClose={handleClose}
      open={visible}
      width={400}
      extra={
        <Space>
          <Button onClick={handleClose}>{__('Cancel', 'website-accessibility')}</Button>
          <Button 
            type="primary" 
            onClick={handleSave}
            disabled={!presetsFormData?.title}
          >
            {__('Save', 'website-accessibility')}
          </Button>
        </Space>
      }
    >
      <div className="wap-quick-edit-form">
        <ControlWrapper 
          label={__('Preset Name', 'website-accessibility')}
          required={true}
        >
          <Input 
            value={presetsFormData?.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={__('Enter preset name', 'website-accessibility')}
          />
        </ControlWrapper>

        <ControlWrapper 
          label={__('Condition', 'website-accessibility')}
          tooltip={__('Select where this preset should be applied', 'website-accessibility')}
        >
          <Select
            value={presetsFormData?.preset?.condition}
            onChange={handleConditionChange}
            options={locationOptions}
            optionLabelProp="label"
            optionFilterProp="label"
            placeholder={__('Select condition', 'website-accessibility')}
          />
        </ControlWrapper>

        <ControlWrapper 
          label={__('Active', 'website-accessibility')}
        >
          <Switch 
            checked={presetsFormData?.preset?.active}
            onChange={handleActiveChange}
          />
        </ControlWrapper>
      </div>
    </Drawer>
  );
};

export default PresetQuickEdit; 