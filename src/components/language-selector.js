import { Collapse, Flex, Input, List, Switch, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import translateLanguages from '../assets/language.json'; // <- Import JSON
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { clickRestoreButtonInTranslateIframe, isScreenReaderActive } from '../utils';
import screenReader from '../screen-reader';

const LangBadge = ({ code, active, isHeader = false }) => {
  const badgeClass = `wap-language-selector__badge ${active ? 'wap-language-selector__badge--active' : ''} ${isHeader ? 'wap-language-selector__badge--header' : 'wap-language-selector__badge--body'}`;

  return (
    <span className={badgeClass}>
      {code?.toUpperCase()} 
    </span>
  );
};

const LanguageSelector = ({ value, accessibilityContext, accessibilityDispatch }) => {
  // Check if we're in frontend context
  const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
  const { enableTranslations, selectedLanguage = 'en', languageSearchInput = '', siteLanguage, currentSettings } = accessibilityContext || {};
  const reader = isScreenReaderActive(currentSettings) ? screenReader() : null;

  // Get settings from the store
  const languageItem = value?.items?.find(item => item.slug === 'language') || {};
  const attributes = languageItem.attributes || {};

  const hideHeaderFlag = attributes.hideHeaderFlag;
  const hideHeaderLanguageCode = attributes.hideHeaderLanguageCode;
  const hideBodyFlag = attributes.hideBodyFlag;
  const hideBodyLanguageCode = attributes.hideBodyLanguageCode;

  useEffect(() => {
    if (!isFrontend) return;

    const combo = document.querySelector('.goog-te-combo');
    if (!combo) return;

    const event = new Event('change');

    if (enableTranslations && selectedLanguage && selectedLanguage !== siteLanguage) {
      combo.value = selectedLanguage;
      combo.dispatchEvent(event);
    } else {
      clickRestoreButtonInTranslateIframe();
    }
  }, [selectedLanguage, enableTranslations, siteLanguage]);



  // Handle language selection
  const handleLanguageSelect = (languageCode) => {
    if (!isFrontend) return;
    if (selectedLanguage === languageCode) {
      accessibilityDispatch({
        type: 'SET_SELECTED_LANGUAGE',
        payload: null,
      });
      reader?.speak(__('Translation language changed to default', 'website-accessibility'));
    } else {
      accessibilityDispatch({
        type: 'SET_SELECTED_LANGUAGE',
        payload: languageCode,
      });
      const selectedLang = translateLanguages.find(lang => lang.code === languageCode);
      reader?.speak(__('Translation language changed to ', 'website-accessibility') + selectedLang?.name);

    }
  };

  // Determine layout based on settings
  const layout = attributes.layout || 'collapse';
  const selectedLang = translateLanguages.find(lang => lang.code === (selectedLanguage || siteLanguage));

  const filtered = translateLanguages.filter(lang => {
    return lang.name.toLowerCase().includes(languageSearchInput.toLowerCase());
  });

  if (layout === 'list') {
    // Simple list layout
    return (
      <div className="wap-language-selector wap-language-selector--list">
        {/* Show selected language at the top */}
        <div className="wap-language-selector__selected">
          {!hideHeaderLanguageCode && <LangBadge code={selectedLang?.code} active={true} isHeader={true} />}
          <span className="wap-language-selector__selected-label">
            {!hideHeaderFlag && selectedLang?.flag} {selectedLang?.name}
          </span>

          <Switch
            className="wap-language-selector__switch"
            checked={enableTranslations}
            onChange={(value) => {
              if (!isFrontend) return;
              accessibilityDispatch({
                type: 'SET_ENABLE_TRANSLATIONS',
                payload: value,
              });
              reader?.speak(enableTranslations ? __('Translation disabled', 'website-accessibility') : __('Translation enabled', 'website-accessibility'));
            }}
          />
        </div>

        <Input
          placeholder="Search language"
          value={languageSearchInput}
          onChange={e => {
            if (!isFrontend) return;
            accessibilityDispatch({
              type: 'SET_LANGUAGE_SEARCH_INPUT',
              payload: e.target.value,
            });
          }}
          className="wap-language-selector__search"
          allowClear
        />
        <div className="wap-language-selector__list-wrapper">
          <List
            itemLayout="horizontal"
            dataSource={filtered}
            split={false}
            renderItem={item => {
              const active = selectedLanguage === item.code;
              return (
                <List.Item
                  key={item.code}
                  className={`wap-language-selector__item ${active ? 'wap-language-selector__item--active' : ''}`}
                  onClick={() => handleLanguageSelect(item.code)}
                  style={{ cursor: 'pointer' }}
                >
                  {!hideBodyLanguageCode && <LangBadge code={item.code} active={active} isHeader={false} />}
                  <span className="wap-language-selector__item-label">
                    {!hideBodyFlag && item.flag} {item.name}
                  </span>
                  {active && (
                    <CheckOutlined className="wap-language-selector__check" />
                  )}
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    );
  }

  // Collapse layout (default)
  const collapseItems = [
    {
      key: '1',
      label: (
        <div className="wap-language-selector__header">
          {!hideHeaderLanguageCode && <LangBadge code={selectedLang?.code} active={true} isHeader={true} />}
          <span className="wap-language-selector__header-label">
            {!hideHeaderFlag && selectedLang?.flag} {selectedLang?.name}
          </span>
        </div>
      ),
      children: (
        <>
          <Input
            placeholder="Search language"
            value={languageSearchInput}
            onChange={e => {
              if (!isFrontend) return;
              accessibilityDispatch({
                type: 'SET_LANGUAGE_SEARCH_INPUT',
                payload: e.target.value,
              });
            }}
            className="wap-language-selector__search"
            allowClear
          />
          <div className="wap-language-selector__list-wrapper">
            <List
              itemLayout="horizontal"
              dataSource={filtered}
              split={false}
              renderItem={item => {
                const active = selectedLanguage === item.code;
                return (
                  <List.Item
                    key={item.code}
                    className={`wap-language-selector__item ${active ? 'wap-language-selector__item--active' : ''}`}
                    onClick={() => handleLanguageSelect(item.code)}
                    style={{ cursor: 'pointer' }}
                  >
                    {!hideBodyLanguageCode && <LangBadge code={item.code} active={active} isHeader={false} />}
                    <span className="wap-language-selector__item-label">
                      {!hideBodyFlag && item.flag} {item.name}
                    </span>
                    {active && (
                      <CheckOutlined className="wap-language-selector__check" />
                    )}
                  </List.Item>
                );
              }}
            />
          </div>
        </>
      ),
      className: 'wap-language-selector__panel'
    }
  ];

  return (
    <div className="wap-language-selector wap-language-selector--collapse">
      {
        layout === 'collapse' && (
          <div className="wap-language-selector--header">
            <Flex align="center" justify="space-between" gap={2}>
              <Typography.Title level={5}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="8" stroke="#1a4cd8" strokeWidth="2" />
                  <circle cx="10" cy="10" r="3" fill="#1a4cd8" />
                </svg>
                {__('Translation', 'website-accessibility')}
              </Typography.Title>
              <Switch
                className="wap-language-selector__switch"
                checked={enableTranslations}
                onChange={(value) => {
                  if (!isFrontend) return;
                  accessibilityDispatch({
                    type: 'SET_ENABLE_TRANSLATIONS',
                    payload: value,
                  });
                  if (enableTranslations) {
                    reader?.speak(__('Translation disabled', 'website-accessibility'));
                  } else {
                    reader?.speak(__('Translation enabled', 'website-accessibility'));
                  }
                }}
                label="Enable Translations"
              />
            </Flex>
          </div>
        )
      }
      <Collapse
        defaultActiveKey={[]}
        bordered={false}
        expandIconPosition="end"
        className="wap-language-selector__collapse"
        items={collapseItems}
      />
    </div>
  );
};

export default LanguageSelector;
