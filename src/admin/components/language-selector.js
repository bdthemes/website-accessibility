import { Collapse, Input, List } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';
import translateLanguages from '../assets/language.json'; // <- Import JSON

const LangBadge = ({ code, active, isHeader = false }) => {
  const badgeClass = `wap-language-selector__badge ${active ? 'wap-language-selector__badge--active' : ''} ${isHeader ? 'wap-language-selector__badge--header' : 'wap-language-selector__badge--body'}`;
  
  return (
    <span className={badgeClass}>
      {code.toUpperCase()}
    </span>
  );
};

const LanguageSelector = ({ value }) => {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState('en');

  // Get settings from the store
  const languageItem = value?.items?.find(item => item.slug === 'language') || {};
  const attributes = languageItem.attributes || {};
  
  const hideHeaderFlag = attributes.hideHeaderFlag;
  const hideHeaderLanguageCode = attributes.hideHeaderLanguageCode;
  const hideBodyFlag = attributes.hideBodyFlag;
  const hideBodyLanguageCode = attributes.hideBodyLanguageCode;

  // Apply CSS variables from settings
  const containerStyle = {
    '--wap-bg-color': attributes.backgroundColor,
    '--wap-padding': attributes.padding,
    '--wap-margin': attributes.margin,
    '--wap-border': attributes.border,
    '--wap-border-radius': attributes.borderRadius,
  };

  const headerStyle = {
    '--wap-header-padding': attributes.headerPadding,
    '--wap-header-margin': attributes.headerMargin,
    '--wap-header-border': attributes.headerBorder,
    '--wap-header-border-radius': attributes.headerBorderRadius,
    '--wap-header-space-between-title-and-badge': attributes.headerSpaceBetweenTitleAndBadge && `${attributes.headerSpaceBetweenTitleAndBadge}px`,
    '--wap-header-title-font-size': attributes.headerTitleFontSize && `${attributes.headerTitleFontSize}px`,
    '--wap-header-title-font-weight': attributes.headerTitleFontWeight,
    '--wap-header-title-text-color': attributes.headerTitleTextColor,
    '--wap-header-badge-background-color': attributes.headerBadgeBackgroundColor,
    '--wap-header-badge-text-color': attributes.headerBadgeTextColor,
    '--wap-header-badge-size': attributes.headerBadgeSize && `${attributes.headerBadgeSize}px`,
    '--wap-header-badge-font-size': attributes.headerBadgeFontSize && `${attributes.headerBadgeFontSize}px`,
    '--wap-header-badge-font-weight': attributes.headerBadgeFontWeight,
    '--wap-header-badge-border': attributes.headerBadgeBorder,
    '--wap-header-badge-border-radius': attributes.headerBadgeBorderRadius,
  };

  const searchBarStyle = {
    '--wap-search-bar-background-color': attributes.searchBarBackgroundColor,
    '--wap-search-bar-text-color': attributes.searchBarTextColor,
    '--wap-search-bar-padding': attributes.searchBarPadding,
    '--wap-search-bar-margin': attributes.searchBarMargin,
    '--wap-search-bar-border': attributes.searchBarBorder,
    '--wap-search-bar-border-radius': attributes.searchBarBorderRadius,
    '--wap-search-bar-box-shadow': attributes.searchBarBoxShadow,
    '--wap-search-bar-font-size': attributes.searchBarFontSize && `${attributes.searchBarFontSize}px`,
    '--wap-search-bar-font-weight': attributes.searchBarFontWeight,
  };

  const bodyStyle = {
    '--wap-body-padding': attributes.bodyPadding,
    '--wap-body-margin': attributes.bodyMargin,
    '--wap-body-border': attributes.bodyBorder,
    '--wap-body-border-radius': attributes.bodyBorderRadius,
    '--wap-body-space-between-item-and-badge': attributes.bodySpaceBetweenItemAndBadge && `${attributes.bodySpaceBetweenItemAndBadge}px`,
    '--wap-body-font-size': attributes.bodyFontSize && `${attributes.bodyFontSize}px`,
    '--wap-body-font-weight': attributes.bodyFontWeight,
    '--wap-body-text-color': attributes.bodyTextColor,
    '--wap-body-badge-background-color': attributes.bodyBadgeBackgroundColor,
    '--wap-body-badge-text-color': attributes.bodyBadgeTextColor,
    '--wap-body-badge-font-size': attributes.bodyBadgeFontSize && `${attributes.bodyBadgeFontSize}px`,
    '--wap-body-badge-font-weight': attributes.bodyBadgeFontWeight,
    '--wap-body-badge-border': attributes.bodyBadgeBorder,
    '--wap-body-badge-border-radius': attributes.bodyBadgeBorderRadius,
    '--wap-body-badge-size': attributes.bodyBadgeSize && `${attributes.bodyBadgeSize}px`,
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
      <div className="wap-language-selector wap-language-selector--list" style={containerStyle}>
        {/* Show selected language at the top */}
        <div className="wap-language-selector__selected" style={headerStyle}>
          {!hideHeaderLanguageCode && <LangBadge code={selected} active={true} isHeader={true} />}
          <span className="wap-language-selector__selected-label">
            {!hideHeaderFlag && selectedLang?.flag} {selectedLang?.name}
          </span>
        </div>
        
        <Input
          placeholder="Search language"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="wap-language-selector__search"
          allowClear
          style={searchBarStyle}
        />
        <div className="wap-language-selector__list-wrapper" style={bodyStyle}>
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
                  onClick={() => setSelected(item.code)}
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
        <div className="wap-language-selector__header" style={headerStyle}>
          {!hideHeaderLanguageCode && <LangBadge code={selected} active={true} isHeader={true} />}
          <span className="wap-language-selector__header-label">
            {!hideHeaderFlag && selectedLang?.flag} {selectedLang?.name}
          </span>
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
            style={searchBarStyle}
          />
          <div className="wap-language-selector__list-wrapper" style={bodyStyle}>
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
                    onClick={() => setSelected(item.code)}
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
    <div className="wap-language-selector wap-language-selector--collapse" style={containerStyle}>
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
