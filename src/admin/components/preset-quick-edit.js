import { Drawer, Input, Switch, Button, Space, message, Select } from 'antd';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { DEFAULT_STATE, STORE_NAME } from '../store';
import ControlWrapper from './control-wrapper';
import { archivePages, locationOptions } from '../../utils';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import WapButton from '../../components/wap-button';
import WapInput from '../../components/wap-input';
import WapDrawer from '../../components/wap-drawer';
import WapSpace from '../../components/wap-space';
import WapSelect from '../../components/wap-select';
import WapSwitch from '../../components/wap-switch';

const PresetQuickEdit = ({
  visible,
  onClose,
  preset: presetRaw,
  onUpdate,
}) => {
  const [posts, setPosts] = useState([]);
  const [searchInput, setSearchInput] = useState('');
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

  const getSelectedPosts = (selectedIds = []) => {
    if (!Array.isArray(selectedIds) || !selectedIds.length > 0) {
      return [];
    }

    const url = addQueryArgs('/wp/v2/search', {
      include: selectedIds?.length ? selectedIds.join(',') : undefined,
      per_page: selectedIds?.length
    });

    return apiFetch({ path: url });
  };

  useEffect(() => {
    (async () => {
      try {
        const selectedPosts = await getSelectedPosts(presetsFormData?.preset?.specificPosts) || [];

        const url = addQueryArgs('/wp/v2/search', {
          search: searchInput,
          per_page: 10
        });

        const response = await apiFetch({ path: url });

        // Merge and remove duplicates
        const posts = [...response, ...selectedPosts].filter(
          (post, index, self) => index === self.findIndex(p => p.id === post.id)
        );

        const postOptions = posts.map((post) => ({
          label: post.title,
          value: post.id
        }));

        setPosts(postOptions);
      } catch (error) {
        console.error(error);
      }
    })();
  }, [searchInput, presetsFormData?.preset?.specificPosts]);


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

      message.success({
        content: __('Preset updated successfully', 'website-accessibility'),
        style: { marginBlockStart: 30 },
      });

      // Clear state after successful update
      clearState();
      onClose();

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      message.error({
        content: __('Failed to update preset', 'website-accessibility'),
        style: { marginBlockStart: 30 },
      });
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
    <WapDrawer
      title={__('Quick Edit Preset', 'website-accessibility')}
      className="wap-preset-quick-edit"
      placement="right"
      onClose={handleClose}
      open={visible}
      width={400}
      rootClassName="wap-panel-quick-edit-drawer"
      extra={
        <WapSpace>
          <WapButton onClick={handleClose}>{__('Cancel', 'website-accessibility')}</WapButton>
          <WapButton
            type="primary"
            onClick={handleSave}
            disabled={!presetsFormData?.title}
          >
            {__('Save', 'website-accessibility')}
          </WapButton>
        </WapSpace>
      }
    >
      <div className="wap-quick-edit-form">
        <ControlWrapper
          label={__('Preset Name', 'website-accessibility')}
          required={true}
        >
          <WapInput
            value={presetsFormData?.title || ''}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder={__('Enter preset name', 'website-accessibility')}
          />
        </ControlWrapper>

        <ControlWrapper
          label={__('Condition', 'website-accessibility')}
          tooltip={__('Select where this preset should be applied', 'website-accessibility')}
        >
          <WapSelect
            value={presetsFormData?.preset?.condition}
            onChange={handleConditionChange}
            options={locationOptions}
            optionLabelProp="label"
            optionFilterProp="label"
            placeholder={__('Select condition', 'website-accessibility')}
          />
        </ControlWrapper>

        {
          presetsFormData?.preset?.condition === 'archive' && (
            <ControlWrapper label={__('Specific Archive Page', 'website-accessibility')} required>
              <WapSelect
                options={archivePages}
                onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, specificArchive: value } })}
                value={presetsFormData?.preset?.specificArchive}
                placeholder={__('keep blank for all archive pages', 'website-accessibility')}
                mode="multiple"
              />
            </ControlWrapper>
          )
        }

        {
          presetsFormData?.preset?.condition === 'singular' && (
            <>
              <ControlWrapper label={__('Specific Posts', 'website-accessibility')} required>
                <WapSelect
                  options={posts}
                  onChange={(value) => setPresetsFormData({ ...presetsFormData, preset: { ...presetsFormData.preset, specificPosts: value } })}
                  value={presetsFormData?.preset?.specificPosts}
                  mode="multiple"
                  showSearch
                  filterOption={(input, option) => option?.label.toLowerCase().includes(input.toLowerCase())}
                  onSearch={(value) => setSearchInput(value)}
                  placeholder={__('keep blank for all', 'website-accessibility')}
                />
              </ControlWrapper>
            </>
          )
        }

        <ControlWrapper
          label={__('Active', 'website-accessibility')}
        >
          <WapSwitch
            checked={presetsFormData?.preset?.active}
            onChange={handleActiveChange}
          />
        </ControlWrapper>
      </div>
    </WapDrawer>
  );
};

export default PresetQuickEdit; 