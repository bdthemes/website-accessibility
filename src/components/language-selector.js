import { Collapse, Flex, Input, List, Switch, Typography } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import translateLanguages from '../assets/language.json';
import { useEffect, useMemo, useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { clickRestoreButtonInTranslateIframe, isScreenReaderActive } from '../utils';
import screenReader from '../screen-reader';

/**
 * Badge component for language codes
 */
const LangBadge = ({ code, active, isHeader = false }) => {
  const badgeClass = `wap-language-selector__badge 
    ${active ? 'wap-language-selector__badge--active' : ''} 
    ${isHeader ? 'wap-language-selector__badge--header' : 'wap-language-selector__badge--body'}`;
  return <span className={badgeClass}>{code?.toUpperCase()}</span>;
};

/**
 * Renders language flag and code with visibility rules
 */
const LangLabel = ({ lang, active, isHeader, hideFlag, hideCode }) => (
  <>
    {!hideCode && <LangBadge code={lang?.code} active={active} isHeader={isHeader} />}
    <span className="wap-language-selector__item-label">
      {!hideFlag && lang?.flag} {lang?.name}
    </span>
  </>
);

const LanguageSelector = ({ value, accessibilityContext, accessibilityDispatch }) => {
  const isFrontend = !!accessibilityContext && !!accessibilityDispatch;
  const {
    enableTranslations,
    selectedLanguage = 'en',
    languageSearchInput = '',
    siteLanguage,
    currentSettings
  } = accessibilityContext || {};

  const reader = isScreenReaderActive(currentSettings) ? screenReader() : null;

  const languageItem = value?.items?.find(item => item.slug === 'language') || {};
  const attributes = languageItem.attributes || {};
  const {
    hideHeaderFlag,
    hideHeaderLanguageCode,
    hideBodyFlag,
    hideBodyLanguageCode,
    layout = 'collapse'
  } = attributes;

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
  }, [selectedLanguage, enableTranslations, siteLanguage, isFrontend]);

  const handleTranslationToggle = useCallback((value) => {
    if (!isFrontend) return;
    accessibilityDispatch({
      type: 'SET_ENABLE_TRANSLATIONS',
      payload: value,
    });
    reader?.speak(
      value
        ? __('Translation enabled', 'website-accessibility')
        : __('Translation disabled', 'website-accessibility')
    );
  }, [isFrontend, accessibilityDispatch, reader]);

  const handleLanguageSelect = useCallback((languageCode) => {
    if (!isFrontend) return;

    if (selectedLanguage === languageCode) {
      accessibilityDispatch({ type: 'SET_SELECTED_LANGUAGE', payload: null });
      reader?.speak(__('Translation reset to site default', 'website-accessibility'));
    } else {
      accessibilityDispatch({ type: 'SET_SELECTED_LANGUAGE', payload: languageCode });
      const selectedLangObj = translateLanguages.find(lang => lang.code === languageCode);
      reader?.speak(
        `${__('Translation language changed to', 'website-accessibility')} ${selectedLangObj?.name}`
      );
    }
  }, [isFrontend, selectedLanguage, accessibilityDispatch, reader]);

  const filteredLanguages = useMemo(
    () =>
      translateLanguages.filter(lang =>
        lang.name.toLowerCase().includes(languageSearchInput.toLowerCase())
      ),
    [languageSearchInput]
  );

  const selectedLang = translateLanguages.find(
    lang => lang.code === (selectedLanguage || siteLanguage)
  );

  const searchInput = (
    <div className="wap-language-selector__search-wrapper">
      <Input
        aria-label={__('Search language', 'website-accessibility')}
        placeholder={__('Search language', 'website-accessibility')}
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
    </div>
  );

  if (layout === 'list') {
    return (
      <div className="wap-language-selector wap-language-selector--list">
        <div className="wap-language-selector__selected">
          <LangLabel
            key={JSON.stringify(selectedLang)}
            lang={selectedLang}
            active={true}
            isHeader={true}
            hideFlag={hideHeaderFlag}
            hideCode={hideHeaderLanguageCode}
          />
          <Switch
            className="wap-language-selector__switch"
            checked={enableTranslations}
            onChange={handleTranslationToggle}
          />
        </div>
        {searchInput}
        <div className="wap-language-selector__list-wrapper">
          <List
            itemLayout="horizontal"
            dataSource={filteredLanguages}
            split={false}
            renderItem={item => {
              const active = selectedLanguage === item.code;
              return (
                <List.Item
                  key={item.code}
                  className={`wap-language-selector__item ${active ? 'wap-language-selector__item--active' : ''}`}
                  onClick={() => handleLanguageSelect(item.code)}
                  style={{ cursor: 'pointer' }}
                  role="menuitemradio"
                  aria-checked={active}
                  lang={item.code}
                >
                  <LangLabel
                    lang={item}
                    active={active}
                    isHeader={false}
                    hideFlag={hideBodyFlag}
                    hideCode={hideBodyLanguageCode}
                  />
                  {active && <CheckOutlined className="wap-language-selector__check" />}
                </List.Item>
              );
            }}
          />
        </div>
      </div>
    );
  }

  const collapseItems = [
    {
      key: '1',
      label: (
        <div className="wap-language-selector__header">
          <LangLabel
            key={JSON.stringify(selectedLang)}
            lang={selectedLang}
            active={true}
            isHeader={true}
            hideFlag={hideHeaderFlag}
            hideCode={hideHeaderLanguageCode}
          />
        </div>
      ),
      children: (
        <>
          {searchInput}
          <div className="wap-language-selector__list-wrapper">
            <List
              itemLayout="horizontal"
              dataSource={filteredLanguages}
              split={false}
              renderItem={item => {
                const active = selectedLanguage === item.code;
                return (
                  <List.Item
                    key={item.code}
                    className={`wap-language-selector__item ${active ? 'wap-language-selector__item--active' : ''}`}
                    onClick={() => handleLanguageSelect(item.code)}
                    style={{ cursor: 'pointer' }}
                    role="menuitemradio"
                    aria-checked={active}
                    lang={item.code}
                  >
                    <LangLabel
                      lang={item}
                      active={active}
                      isHeader={false}
                      hideFlag={hideBodyFlag}
                      hideCode={hideBodyLanguageCode}
                    />
                    {active && <CheckOutlined className="wap-language-selector__check" />}
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
            onChange={handleTranslationToggle}
            aria-label={__('Enable translations', 'website-accessibility')}
          />
        </Flex>
      </div>
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
