import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from "@wordpress/data";
import { DEFAULT_STATE, STORE_NAME } from "../store";
import { useHistory } from '../router';
import { useDashboardTour } from '../context/dashboard-tour-context';
import PresetEditorPreview from '../components/preset-editor-preview';
import PanelCustomizationPreset from '../components/preset-panel-customization';

function getFreshPresetsFormData() {
  return {
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
  };
}

const CreatePreset = () => {
  const { WapCard, WapButton, WapSpace, WapTypography, WapInput } = window?.wapComponents;
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const { setPresetsFormData, createPreset } = useDispatch(STORE_NAME);
  const history = useHistory();
  const { notifyPresetSavedForTour } = useDashboardTour();
  const { Title } = WapTypography;
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setPresetsFormData(getFreshPresetsFormData());
  }, []);

  const handleSavePreset = async () => {
    if (!presetsFormData?.title || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await createPreset(presetsFormData);
      setPresetsFormData(getFreshPresetsFormData());
      history.push({
        page: 'website-accessibility-presets',
      });
      notifyPresetSavedForTour();
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const categoryNodes = Array.from(document.querySelectorAll('[data-control-category]'));

    categoryNodes.forEach((categoryNode) => {
      const controlNodes = Array.from(
        categoryNode.querySelectorAll('.wap-control-wrapper[data-search-control-label]'),
      );

      let hasMatchInCategory = false;
      controlNodes.forEach((controlNode) => {
        const controlLabel = (controlNode.getAttribute('data-search-control-label') || '').toLowerCase();
        const matched = !keyword || controlLabel.includes(keyword);
        controlNode.style.display = matched ? '' : 'none';
        if (matched) hasMatchInCategory = true;
      });

      const categoryBlock = categoryNode.closest('.wap-preset-sections__content, .wap-panel-customization__collapse');
      const shouldShow = !keyword || hasMatchInCategory;
      categoryNode.style.display = shouldShow ? '' : 'none';
      if (categoryBlock) {
        categoryBlock.style.display = shouldShow ? '' : 'none';
      }
    });
  }, [searchTerm, presetsFormData]);

  return (
    <div className="wap-preset-editor">
      <PresetEditorPreview />
      <div className="wap-preset-editor-content">
        <WapCard className='wap-header-card'>
          <Title level={2} className='wap-header-card-title'>
            {__('Create New Preset', 'website-accessibility')}
          </Title>
          <WapInput
            className="wap-preset-editor-header-card-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={__('Search controls...', 'website-accessibility')}
            prefix={<span className='dashicons dashicons-search' />}
            style={{ width: 300 }}
            allowClear
          />
        </WapCard>

        <PanelCustomizationPreset />
      </div>

      <div className="wap-preset-form-actions" data-tour="wap-tour-preset-finish" style={{ marginTop: 24 }}>
        <WapSpace>
          <span data-tour="wap-tour-save-preset" style={{ display: 'inline-flex' }}>
            <WapButton
              type="primary"
              size='large'
              disabled={!presetsFormData?.title || isSaving}
              loading={isSaving}
              onClick={handleSavePreset}
            >
              <WapSpace>
                {__('Save Preset', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </WapSpace>
            </WapButton>
          </span>
        </WapSpace>
      </div>
    </div>
  );
};

export default CreatePreset;
