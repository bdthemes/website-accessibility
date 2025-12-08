import { DeleteOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';


// Simple debounce helper
const debounce = (fn, delay = 1000) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};


const PanelFooter = ({ value, accessibilityContext, accessibilityDispatch }) => {
  const { WapMessage, WapButton, WapFlex } = window?.wapComponents;
  const [savingPreference, setSavingPreference] = useState(false);
  const [deletingPreference, setDeletingPreference] = useState(false);
  const [hasSavedPreference, setHasSavedPreference] = useState(false);
  const [savePreference, setSavePreference] = useState();
  const [loadingPreference, setLoadingPreference] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const { getCookie, removeCookie } = window.wapHelpers;

  const isLanguageActive = useMemo(() => {
    return value?.items?.find(item => item.slug === 'language')?.active || false;
  }, []);

  useEffect(() => {
    const consent = getCookie("wapGoogleTranslateConsent");
    setShowConsent(consent);
  }, []);

  // ✅ Ant Design message
  const [messageApi, contextHolder] = WapMessage.useMessage();

  const footerItem = value?.items?.find(item => item.slug === 'footer');
  const attributes = footerItem?.attributes || {};
  const isProActive = window?.websacPro?.isProActive || false;
  const { currentPresetId, isUserLoggedIn, statementLink, settings } = window?.websiteAccessibility || {};
  const isFrontend = !!accessibilityContext && !!accessibilityDispatch;

  const resetBtnText = attributes.resetBtnText || 'Reset All';
  const showStatement = attributes.showStatement !== false;
  const statementText = attributes.statementText || 'Statement';
  const showBranding = isProActive ? attributes.showBranding !== false : true;
  const brandingText = isProActive ? attributes.brandingText || 'Powered by One Accessibility' : 'Powered by One Accessibility';
  const showPreference = attributes?.activePreference || false;
  const savePreferenceText = attributes.saveBtnText || __('Save Pref.', 'website-accessibility');
  const updatePreferenceText = attributes.updateBtnText || __('Update Pref.', 'website-accessibility');
  const deletePreferenceText = attributes.deleteBtnText || __('Delete Pref.', 'website-accessibility');

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
  };

  const saveablePreference = useMemo(() => {
    if (!isFrontend || !currentPresetId || !isUserLoggedIn) return null;
    const { currentProfile, currentSettings, isOverSized, enableTranslations, selectedLanguage } = accessibilityContext;

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
    if (enableTranslations || settings?.always_on_translations) {
      data.enableTranslations = enableTranslations;
      data.selectedLanguage = selectedLanguage;
    }

    return { post_id: currentPresetId, data };
  }, [accessibilityContext?.currentProfile, accessibilityContext?.currentSettings, accessibilityContext?.isOverSized, accessibilityContext?.enableTranslations, accessibilityContext?.selectedLanguage, currentPresetId, isFrontend, isUserLoggedIn, settings?.always_on_translations]);

  // Fetch preference state
  useEffect(() => {
    if (!isFrontend || !currentPresetId || !isUserLoggedIn) return;
    setLoadingPreference(true);

    apiFetch({ path: `/sigmally/v1/preference?post_id=${currentPresetId}`, method: 'GET' })
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

  // Reset
  const handleReset = () => {
    if (!isFrontend) return;
    accessibilityDispatch({ type: 'RESET_ACCESSIBILITY' });
    messageApi.info({
      content: __('All accessibility settings have been reset to default.', 'website-accessibility'),
      style: { marginBlockStart: 20 },
    });
  };

  const handleClearConsent = () => {
    if (!isFrontend) return;
    removeCookie('wapGoogleTranslateConsent');
    window.location.reload();
  };

  // Save
  const handleSave = useCallback(
    debounce(async () => {
      if (!isFrontend || !currentPresetId || !isUserLoggedIn) return;
      setSavingPreference(true);

      try {
        await apiFetch({ path: '/sigmally/v1/preference', method: 'POST', data: saveablePreference });
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
        await apiFetch({ path: `/sigmally/v1/preference?post_id=${currentPresetId}`, method: 'DELETE' });
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
        <WapFlex align="center" justify="space-between" gap={10} style={{ marginBottom: '10px', padding: '0 24px' }}>
          <WapButton
            type="primary"
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
            icon={<DeleteOutlined />}
            size="large"
            block
            onClick={handleDelete}
            loading={deletingPreference}
            disabled={isFrontend ? !hasSavedPreference || deletingPreference || loadingPreference : false}
          >
            {deletePreferenceText}
          </WapButton>
        </WapFlex>
      )}

      <WapFlex className="wap-panel-footer__actions">
        <WapButton
          className="wap-panel-footer__reset-btn"
          type="primary"
          icon={<ReloadOutlined />}
          size="large"
          block
          onClick={handleReset}
        >
          {resetBtnText}
        </WapButton>

        {
          (isProActive && showConsent && isLanguageActive) && (
            <WapButton
              className="wap-panel-footer__reset-btn"
              type="primary"
              size="large"
              block
              onClick={handleClearConsent}
            >
              {__('Clear consent', 'website-accessibility')}
            </WapButton>
          )
        }
      </WapFlex>

      {(showBranding || showStatement) && (
        <div className="wap-panel-footer__links">
          {showBranding && (
            <div className="wap-panel-footer__brand-left-text">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.0557 37.04C24.4857 40.37 25.3357 43.4902 26.5557 46.1602H21.5557C22.7757 43.4902 23.6257 40.37 24.0557 37.04ZM31.3262 2C32.066 2.00014 32.7256 2.46026 32.9756 3.16016L46.0459 43.8096L46.0361 43.7803C46.4458 44.9202 45.5956 46.1299 44.3857 46.1299H31.9658C31.9458 46.0799 31.9255 46.0402 31.8955 45.9902C30.0355 42.8902 28.8257 38.45 28.5957 33.79C28.5157 32.02 28.5561 30.2698 28.7461 28.5898C31.026 28.2898 33.1961 27.7602 35.166 27.0303C36.4158 26.5703 37.0456 25.1903 36.5859 23.9404C36.126 22.6906 34.746 22.0598 33.4961 22.5195C30.6961 23.5595 27.3657 24.1104 23.8857 24.1104C20.4058 24.1103 17.156 23.5696 14.376 22.5596C13.126 22.1096 11.7462 22.7501 11.2861 24C10.8362 25.2499 11.4758 26.6297 12.7256 27.0898C14.7556 27.8298 17.016 28.3504 19.376 28.6504C19.5559 30.3201 19.6056 32.0499 19.5156 33.8096C19.2856 38.4695 18.0758 42.9098 16.2158 46.0098L16.1455 46.1504H3.75586C2.5559 46.1504 1.70579 44.97 2.0957 43.8301L14.5361 3.19043C14.7761 2.48043 15.4463 2 16.1963 2H31.3262ZM27.7559 18.3301C27.5559 16.3001 25.7458 14.8196 23.7158 15.0195C21.6859 15.2195 20.2065 17.0297 20.4062 19.0596C20.6063 21.0896 22.4163 22.5701 24.4463 22.3701C26.476 22.1699 27.9558 20.3599 27.7559 18.3301Z" fill="url(#paint0_linear_258_14)" />
                <defs>
                  <linearGradient id="paint0_linear_258_14" x1="13" y1="3" x2="43" y2="44.5" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#007BFF" />
                    <stop offset="1" stopColor="#005A9C" />
                  </linearGradient>
                </defs>
              </svg>
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
