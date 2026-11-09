import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useDispatch, useSelect } from "@wordpress/data";
import { store as coreStore } from '@wordpress/core-data';
import { STORE_NAME } from "../store";
import { useUnsavedChangesGuard } from '../utils/unsaved-changes';
import { useHistory, useLocation } from '../router';
import { useDashboardTour } from '../context/dashboard-tour-context';
import PresetEditorPreview from '../components/preset-editor-preview';
import PanelCustomizationPreset from '../components/preset-panel-customization';

/**
 * Form data for a stored preset: its title plus the decoded JSON content.
 * Returns null when the content is not valid JSON (hand-edited or damaged post).
 */
const toFormData = (title, content) => {
  let decoded;
  try {
    decoded = typeof content === 'string' ? JSON.parse(content) : content;
  } catch (e) {
    return null;
  }
  if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
    return null;
  }
  const rest = { ...decoded };
  delete rest.title;
  return { title, ...rest };
};

const rawValue = (field) => (field && typeof field === 'object' ? field.raw : field);


const EditPreset = () => {
  const { WapCard, WapButton, WapSpace, WapTypography, WapInput, WapMessage } = window?.wapComponents;
  const { updatePreset, saveEditedPreset, setPresetsFormData } = useDispatch(STORE_NAME);
  const history = useHistory();
  const location = useLocation();
  const { notifyPresetSavedForTour } = useDashboardTour();
  const id = location?.params?.id;
  const page = location?.params?.page;
  const { Title } = WapTypography;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!id || !page) {
      history.push({
        page: 'website-accessibility-presets',
      });
    }
  }, [location]);

  // getEditedEntityRecord is false until the record has loaded, so "no preset"
  // only means missing once core-data has finished resolving it (404 / no access).
  const { preset, savedRecord, isResolved } = useSelect((select) => {
    const core = select(coreStore);
    const args = ['postType', 'websac_preset', id];
    return {
      preset: select(STORE_NAME).getPreset(id),
      savedRecord: core.getEntityRecord(...args),
      isResolved: !id || core.hasFinishedResolution('getEntityRecord', args),
    };
  }, [id]);
  const { presetsFormData } = useSelect((select) => select(STORE_NAME).getPresetsFormData());
  const [isSaving, setIsSaving] = useState(false);
  const [loadedId, setLoadedId] = useState(null);
  const hasPreset = !!preset && Object.keys(preset).length > 0;

  // Load preset data into global state when preset is available
  useEffect(() => {
    if (hasPreset) {
      const presetData = toFormData(preset?.title, preset?.content);
      if (!presetData) {
        WapMessage.error(__('This preset\'s settings could not be read.', 'website-accessibility'));
        history.push({ page: 'website-accessibility-presets' });
        return;
      }
      setPresetsFormData(presetData);
      setLoadedId(id);
    } else if (isResolved) {
      history.push({
        page: 'website-accessibility-presets',
      });
    }
  }, [preset, isResolved]);

  // Unsaved changes: compare the form with what is stored on the server. Using
  // the saved record (not a snapshot) keeps it right after an add-on (the Pro
  // tour) saves the preset on its own.
  const savedSnapshot = useMemo(() => {
    if (!savedRecord) return null;
    const data = toFormData(rawValue(savedRecord.title), rawValue(savedRecord.content));
    return data ? JSON.stringify(data) : null;
  }, [savedRecord]);
  const isDirty = loadedId === id
    && savedSnapshot !== null
    && !!presetsFormData
    && JSON.stringify(presetsFormData) !== savedSnapshot;
  useUnsavedChangesGuard(isDirty && !isSaving);

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

  if (!hasPreset) return null;

  const handleSave = async () => {
    if (!presetsFormData?.title || isSaving) {
      return;
    }
    setIsSaving(true);
    let result;
    try {
      await updatePreset(id, {
        title: presetsFormData.title,
        content: JSON.stringify(presetsFormData),
      });
      result = await saveEditedPreset(id);
    } finally {
      setIsSaving(false);
    }

    // Leaving the editor on a failed save would show the old values again and
    // read as "my change reverted itself" — keep the user here and say why.
    if (result && result.success === false) {
      WapMessage.error(
        result.error?.message ||
        __('Could not save the preset. Check your connection and try again.', 'website-accessibility')
      );
      return;
    }

    if (result?.unchanged) {
      WapMessage.info(__('No changes to save.', 'website-accessibility'));
      return;
    }

    notifyPresetSavedForTour();

    // Announce the save so add-ons (the Pro guided tour) can react. Dispatched
    // only on success, so nothing can treat a failed save as a completed step.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('websac-preset-saved', { detail: { presetId: id } })
      );
    }

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

      {/* <Card className="wap-preset-form-actions-card" style={{ marginTop: 24 }}> */}
      <div className="wap-preset-form-actions" style={{ marginTop: 24 }}>
        <WapSpace>
          <span data-tour="wap-tour-save-preset" style={{ display: 'inline-flex' }}>
            <WapButton
              type="primary"
              onClick={handleSave}
              size='large'
              disabled={!presetsFormData?.title || isSaving}
              loading={isSaving}
            >
              <WapSpace>
                {__('Update Preset', 'website-accessibility')}
                <span className='dashicons dashicons-arrow-right-alt' />
              </WapSpace>
            </WapButton>
          </span>
        </WapSpace>
      </div>
      {/* </Card> */}
    </div>
  );
};

export default EditPreset;
