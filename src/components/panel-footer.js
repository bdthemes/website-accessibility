import { DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { __, sprintf } from '@wordpress/i18n';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import PanelBrandIcon from './panel-brand-icon';


// Simple debounce helper
const debounce = (fn, delay = 1000) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};


const PanelFooter = ({ value, accessibilityContext, accessibilityDispatch, isEditorPreview = false }) => {
  const { WapMessage, WapButton } = window?.wapComponents;
  const [savingPreference, setSavingPreference] = useState(false);
  const [deletingPreference, setDeletingPreference] = useState(false);
  const [hasSavedPreference, setHasSavedPreference] = useState(false);
  const [savePreference, setSavePreference] = useState();
  const [loadingPreference, setLoadingPreference] = useState(false);
  // ✅ Ant Design message
  const [messageApi, contextHolder] = WapMessage.useMessage();

  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};
  const { currentPresetId, isUserLoggedIn, statementLink } = window?.websiteAccessibility || {};
  const isFrontend = !isEditorPreview && !!accessibilityContext && !!accessibilityDispatch;

  const showStatement = attributes.showStatement !== false;
  const statementText = __('Accessibility Statement', 'website-accessibility');
  const showBranding = attributes.showBranding !== false;
  const [wlBrandEpoch, setWlBrandEpoch] = useState(0);

  useEffect(() => {
    const onWlChange = () => setWlBrandEpoch((n) => n + 1);
    window.addEventListener('websac-white-label-changed', onWlChange);
    return () => window.removeEventListener('websac-white-label-changed', onWlChange);
  }, []);

  const brandDisplayName = useMemo(() => {
    const defaultBrand = __('One Accessibility', 'website-accessibility');
    const name = (
      window?.websiteAccessibility?.brandDisplayName ||
      window?.websacAdmin?.brandDisplayName ||
      defaultBrand
    ).trim();
    return name || defaultBrand;
  }, [wlBrandEpoch]);

  const brandingText = useMemo(
    () =>
      sprintf(
        /* translators: %s: plugin or white-label brand name */
        __('Powered by %s', 'website-accessibility'),
        brandDisplayName
      ),
    [brandDisplayName]
  );
  const showPreference = attributes?.activePreference || false;
  const savePreferenceText = __('Save Preference', 'website-accessibility');
  const updatePreferenceText = __('Update Preference', 'website-accessibility');
  const deletePreferenceText = __('Delete Preference', 'website-accessibility');

  const footerStyle = {
    '--wap-footer-general-bg': attributes.generalBg,
    '--wap-footer-general-padding': attributes.generalPadding,
    '--wap-footer-general-radius': attributes.generalRadius,
    '--wap-footer-reset-btn-bg': attributes.resetBtnBg,
    '--wap-footer-reset-btn-color': attributes.resetBtnColor,
    '--wap-footer-reset-btn-radius': attributes.resetBtnRadius,
    '--wap-footer-reset-btn-font-size': attributes.resetBtnFontSize,
    '--wap-footer-reset-btn-font-weight': attributes.resetBtnFontWeight,
    '--wap-footer-link-color': attributes.linkColor,
    '--wap-footer-branding-color': attributes.brandingColor,
    ...(attributes.preferenceSaveBg ? { '--wap-footer-preference-save-bg': attributes.preferenceSaveBg } : {}),
    ...(attributes.preferenceSaveColor ? { '--wap-footer-preference-save-color': attributes.preferenceSaveColor } : {}),
    ...(attributes.preferenceSaveBorderColor
      ? { '--wap-footer-preference-save-border-color': attributes.preferenceSaveBorderColor }
      : {}),
    ...(attributes.preferenceDeleteBg ? { '--wap-footer-preference-delete-bg': attributes.preferenceDeleteBg } : {}),
    ...(attributes.preferenceDeleteColor
      ? { '--wap-footer-preference-delete-color': attributes.preferenceDeleteColor }
      : {}),
    ...(attributes.preferenceDeleteBorderColor
      ? { '--wap-footer-preference-delete-border-color': attributes.preferenceDeleteBorderColor }
      : {}),
  };

  const saveablePreference = useMemo(() => {
    if (!isFrontend || !currentPresetId || !isUserLoggedIn) return null;
    const { currentProfile, currentSettings, isOverSized, selectedLanguage } = accessibilityContext;

    const serializableProfile = {
      id: currentProfile?.id,
      name: currentProfile?.name,
      icon: currentProfile?.icon?.props?.dangerouslySetInnerHTML
        ? { __html: currentProfile.icon.props.dangerouslySetInnerHTML.__html }
        : currentProfile?.icon,
    };

    let data = {};
    if (serializableProfile?.id) data.profile = serializableProfile;

    if (Object.keys(currentSettings).length > 0) {
      let settings = {};
      Object.keys(currentSettings).forEach((key) => {
        if (currentSettings[key]?.currentStep !== 0) settings[key] = currentSettings[key];
      });
      if (Object.keys(settings).length > 0) data.settings = settings;
    }

    if (isOverSized) data.oversized = isOverSized;
    if (selectedLanguage) {
      data.selectedLanguage = selectedLanguage;
    }

    return { post_id: currentPresetId, data };
  }, [accessibilityContext?.currentProfile, accessibilityContext?.currentSettings, accessibilityContext?.isOverSized, accessibilityContext?.selectedLanguage, currentPresetId, isFrontend, isUserLoggedIn]);

  // Fetch preference state
  useEffect(() => {
    if (!isFrontend || !currentPresetId || !isUserLoggedIn) return;
    setLoadingPreference(true);

    apiFetch({ path: `/websac/v1/preference?post_id=${currentPresetId}`, method: 'GET' })
      .then((response) => {
        setHasSavedPreference(response?.success && response.data && Object.keys(response.data).length > 0);
        setSavePreference(response?.data);
      })
      .catch(() => {
        setHasSavedPreference(false);
        setSavePreference(null);
        messageApi.error({
          content: __('Failed to load preferences. Please try again.', 'website-accessibility'),
          style: { marginBlockStart: 20 },
        });
      })
      .finally(() => setLoadingPreference(false));
  }, [currentPresetId, isUserLoggedIn, isFrontend, saveablePreference, savingPreference]);

  // Save
  const handleSave = useCallback(
    debounce(async () => {
      if (!isFrontend || !currentPresetId || !isUserLoggedIn) return;
      setSavingPreference(true);

      try {
        await apiFetch({ path: '/websac/v1/preference', method: 'POST', data: saveablePreference });
        setHasSavedPreference(true);
        messageApi.success({
          content: hasSavedPreference
            ? __('Preferences updated successfully.', 'website-accessibility')
            : __('Preferences saved successfully.', 'website-accessibility'),
          style: { marginBlockStart: 20 },
        });
      } catch (error) {
        console.error(error);
        messageApi.error({
          content: __('Failed to save preferences. Please try again.', 'website-accessibility'),
          style: { marginBlockStart: 20 },
        });
      } finally {
        setSavingPreference(false);
      }
    }, 1000),
    [isFrontend, currentPresetId, isUserLoggedIn, accessibilityContext, hasSavedPreference]
  );

  // Delete
  const handleDelete = useCallback(
    debounce(async () => {
      if (!isFrontend || !currentPresetId || !isUserLoggedIn) return;
      setDeletingPreference(true);

      try {
        await apiFetch({ path: `/websac/v1/preference?post_id=${currentPresetId}`, method: 'DELETE' });
        setHasSavedPreference(false);
        messageApi.success({
          content: __('Preferences deleted successfully.', 'website-accessibility'),
          style: { marginBlockStart: 20 },
        });
      } catch (error) {
        console.error(error);
        messageApi.error({
          content: __('Failed to delete preferences. Please try again.', 'website-accessibility'),
          style: { marginBlockStart: 20 },
        });
      } finally {
        setDeletingPreference(false);
      }
    }, 1000),
    [isFrontend, currentPresetId, isUserLoggedIn]
  );

  let statementLinkAttr = {};
  if (statementLink) {
    statementLinkAttr = {
      target: '_blank',
      rel: 'noopener noreferrer',
      href: statementLink,
      className: 'wap-panel-footer__statement-link'
    };
  } else {
    statementLinkAttr = {
      className: 'wap-panel-footer__statement-link',
      onClick: (e) => {
        e.preventDefault();
      },
    };
  }



  return (
    <footer className="wap-panel-footer" style={footerStyle}>
      {contextHolder}

      {(isUserLoggedIn || !isFrontend) && showPreference && (
        <div className="wap-panel-footer__actions">
          <WapButton
            type="primary"
            className="wap-panel-footer__preference-save"
            icon={<SaveOutlined />}
            size="large"
            block
            onClick={handleSave}
            loading={savingPreference || loadingPreference}
            disabled={!isFrontend ? false : Object.keys(saveablePreference?.data || {}).length === 0 || JSON.stringify(saveablePreference?.data) === JSON.stringify(savePreference)}
          >
            {hasSavedPreference
              ? updatePreferenceText
              : savePreferenceText}
          </WapButton>

          <WapButton
            danger
            type="primary"
            className="wap-panel-footer__preference-delete"
            icon={<DeleteOutlined />}
            size="large"
            block
            onClick={handleDelete}
            loading={deletingPreference}
            disabled={isFrontend ? !hasSavedPreference || deletingPreference || loadingPreference : false}
          >
            {deletePreferenceText}
          </WapButton>
        </div>
      )}

      {(showBranding || showStatement) && (
        <div className="wap-panel-footer__links">
          {showBranding && (
            <div className="wap-panel-footer__brand-left-text">
              <PanelBrandIcon variant="footer" />
              <span className="wap-panel-footer__brand-text">
                {brandingText}
              </span>
            </div>
          )}

          {showStatement && (
            <a
              {...statementLinkAttr}
            >
              {statementText}
            </a>
          )}
        </div>
      )}
    </footer>
  );
};

export default PanelFooter;
