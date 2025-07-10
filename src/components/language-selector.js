import { Collapse, Input, List, Switch } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import translateLanguages from '../assets/language.json'; // <- Import JSON

const LangBadge = ({ code, active, isHeader = false }) => {
  const badgeClass = `wap-language-selector__badge ${active ? 'wap-language-selector__badge--active' : ''} ${isHeader ? 'wap-language-selector__badge--header' : 'wap-language-selector__badge--body'}`;
  
  return (
    <span className={badgeClass}>
      {code.toUpperCase()}
    </span>
  );
};

const LanguageSelector = ({ value, onChange, accessibilityContext }) => {
  // Check if we're in frontend context
  const isFrontend = !!accessibilityContext;
  const { settings, updateSetting } = accessibilityContext || {};
  
  // Local state for editor, context state for frontend
  const [localSelected, setLocalSelected] = useState('en');
  const [search, setSearch] = useState('');
  
  // Use context language in frontend, local state in editor
  const selected = isFrontend ? (settings?.language || 'en') : localSelected;

  // Get settings from the store
  const languageItem = value?.items?.find(item => item.slug === 'language') || {};
  const attributes = languageItem.attributes || {};
  
  const hideHeaderFlag = attributes.hideHeaderFlag;
  const hideHeaderLanguageCode = attributes.hideHeaderLanguageCode;
  const hideBodyFlag = attributes.hideBodyFlag;
  const hideBodyLanguageCode = attributes.hideBodyLanguageCode;

  // Handle language selection
  const handleLanguageSelect = (languageCode) => {
    if (isFrontend && updateSetting) {
      // In frontend: update context
      updateSetting('language', languageCode);
      console.log('Updated language in frontend:', languageCode);
    } else {
      // In editor: update local state and call onChange
      setLocalSelected(languageCode);
      if (onChange) {
        onChange({ language: languageCode });
      }
      console.log('Updated language in editor:', languageCode);
    }
  };

  const filtered = translateLanguages.filter(lang =>
    lang.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLang = translateLanguages.find(l => l.code === selected);

  // Determine layout based on settings
  const layout = attributes.layout || 'collapse';

  if (layout === 'list') {
    // Simple list layout
    return (
      <div className="wap-language-selector wap-language-selector--list">
        {/* Show selected language at the top */}
        <div className="wap-language-selector__selected">
          {!hideHeaderLanguageCode && <LangBadge code={selected} active={true} isHeader={true} />}
          <span className="wap-language-selector__selected-label">
            {!hideHeaderFlag && selectedLang?.flag} {selectedLang?.name}
          </span>

          <Switch className="wap-language-selector__switch" onChange={() => {
            if (isFrontend) {
              updateSetting('language', 'en');
            } else {
              setLocalSelected('en');
            }
          }} />
        </div>
        
        <Input
          placeholder="Search language"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="wap-language-selector__search"
          allowClear
        />
        <div className="wap-language-selector__list-wrapper">
          <List
            itemLayout="horizontal"
            dataSource={filtered}
            split={false}
            renderItem={item => {
              const active = selected === item.code;
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
          {!hideHeaderLanguageCode && <LangBadge code={selected} active={true} isHeader={true} />}
          <span className="wap-language-selector__header-label">
            {!hideHeaderFlag && selectedLang?.flag} {selectedLang?.name}
          </span>
          <Switch className="wap-language-selector__switch" onChange={() => {
            if (isFrontend) {
              updateSetting('language', 'en');
            } else {
              setLocalSelected('en');
            }
          }} />
        </div>
      ),
      children: (
        <>
          <Input
            placeholder="Search language"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="wap-language-selector__search"
            allowClear
          />
          <div className="wap-language-selector__list-wrapper">
            <List
              itemLayout="horizontal"
              dataSource={filtered}
              split={false}
              renderItem={item => {
                const active = selected === item.code;
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
